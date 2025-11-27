const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss'); // Aliyun SDK
const { createClient } = require('webdav'); // WebDAV for 115/Tianyi
const OpenAI = require('openai');
const { downloadFile } = require('../utils/aria2');

// --- Configuration Helper ---
const getOssClient = () => {
    if (!process.env.ALIYUN_ACCESS_KEY_ID) return null;
    return new OSS({
        region: process.env.ALIYUN_REGION, // e.g., oss-cn-hangzhou
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        bucket: process.env.ALIYUN_BUCKET
    });
};

const getWebDavClient = () => {
    if (!process.env.WEBDAV_URL) return null;
    return createClient(
        process.env.WEBDAV_URL, // e.g., http://alist:5244/dav
        {
            username: process.env.WEBDAV_USER,
            password: process.env.WEBDAV_PASSWORD
        }
    );
};

const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) return null;
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL // Optional for proxies
    });
};

// @desc    Start Offline Download & Auto Upload
// @route   POST /api/tasks/download
exports.startDownload = async (req, res) => {
  const { url, targetDrive } = req.body;
  const userId = req.user._id; 
  const io = req.app.get('io');

  try {
    const task = await Task.create({
      userId,
      type: 'download',
      sourceUrl: url,
      targetDrive,
      status: 'pending',
      filename: 'Initializing...',
      logs: ['Task queued.']
    });

    res.status(201).json(task);

    // Process asynchronously
    processTaskChain(task, io);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Organize Files
// @route   POST /api/tasks/ai-organize
exports.aiOrganize = async (req, res) => {
    const { path: folderPath, drive } = req.body;
    const userId = req.user._id;

    if (!req.user.isVip) {
        return res.status(403).json({ message: 'VIP only feature' });
    }

    try {
        const openai = getOpenAI();
        if (!openai) throw new Error('OpenAI not configured on server');

        // 1. Mock listing files (In real app, use OSS/WebDAV list)
        // const files = await listFilesFromDrive(drive, folderPath); 
        const files = ["invoice_2023.pdf", "holiday_video.mp4", "dcim_001.jpg"]; // Mock data

        // 2. Call OpenAI
        const completion = await openai.chat.completions.create({
            messages: [{ 
                role: "system", 
                content: "You are a file organizer. Return JSON array: [{filename, category, newPath}]" 
            }, {
                role: "user",
                content: `Organize these files: ${JSON.stringify(files)}`
            }],
            model: "gpt-3.5-turbo",
        });

        const proposal = completion.choices[0].message.content;
        
        // Log this AI task
        await Task.create({
            userId,
            type: 'ai_organize',
            status: 'completed',
            logs: ['AI Analysis completed', proposal]
        });

        res.json({ success: true, proposal: JSON.parse(proposal) });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- Internal Logic ---

const processTaskChain = async (task, io) => {
    const downloadPath = path.join(__dirname, '../../downloads', `${task._id}`);
    
    // 1. Download Phase
    task.status = 'processing';
    task.logs.push(`Starting aria2c download to ${downloadPath}...`);
    await task.save();
    emitUpdate(io, task);

    // Ensure dir exists
    if (!fs.existsSync(path.dirname(downloadPath))) fs.mkdirSync(path.dirname(downloadPath), { recursive: true });

    downloadFile(task.sourceUrl, downloadPath,
        (progress) => { /* Update progress if needed */ },
        async () => {
            task.progress = 50;
            task.logs.push('Download finished. Starting upload...');
            await task.save();
            emitUpdate(io, task);

            // 2. Upload Phase
            try {
                const filename = path.basename(task.sourceUrl); // Simplification
                const localFilePath = downloadPath; // Aria2 usually names it

                if (task.targetDrive === 'aliyun') {
                    const oss = getOssClient();
                    if (oss) {
                        await oss.put(`/downloads/${filename}`, localFilePath);
                        task.logs.push('Uploaded to Aliyun OSS successfully.');
                    } else {
                        task.logs.push('Aliyun OSS not configured, skipped upload.');
                    }
                } else {
                    // 115 or Tianyi via WebDAV
                    const webdav = getWebDavClient();
                    if (webdav) {
                        const data = fs.readFileSync(localFilePath);
                        await webdav.putFileContents(`/${task.targetDrive}/${filename}`, data);
                        task.logs.push(`Uploaded to ${task.targetDrive} via WebDAV.`);
                    } else {
                        task.logs.push('WebDAV not configured, skipped upload.');
                    }
                }

                task.status = 'completed';
                task.progress = 100;
                await task.save();
                emitUpdate(io, task);

                // Cleanup
                // fs.unlinkSync(localFilePath);

            } catch (err) {
                failTask(task, `Upload failed: ${err.message}`, io);
            }
        },
        (err) => failTask(task, `Download failed: ${err}`, io)
    );
};

const failTask = async (task, msg, io) => {
    task.status = 'error';
    task.errorMessage = msg;
    task.logs.push(msg);
    await task.save();
    emitUpdate(io, task);
};

const emitUpdate = (io, task) => {
    io.to(task.userId.toString()).emit('task_update', {
        taskId: task._id,
        status: task.status,
        progress: task.progress,
        logs: task.logs
    });
};