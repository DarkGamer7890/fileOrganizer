import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

const logger = new EventEmitter();

logger.on('log', (mess, folderPath) => {
    const logMessage = `[${new Date().toISOString()}] ${mess}\n`;
    const logPath = path.join(folderPath, 'logs.txt');

    try{
        fs.appendFileSync(logPath, logMessage);
    }
    catch(err){
        console.log('Error in writing log', err);
    }
});

const organizer = (folderPath) => {

    const fileTypes = {
        'Images': ['.jpg', '.png', '.jpeg', '.svg'],
        'Documents': ['.pdf', '.docx', '.txt', '.ppt', '.doc', '.xml', '.pptx'],
        'Videos': ['.mp4', '.mkv'],
    };
    
    fs.readdirSync(folderPath).forEach(file => {
        const ext = path.extname(file).toLowerCase();
        let folder = 'Others';

        for(const [key, exts] of Object.entries(fileTypes)){
            if(exts.includes(ext)){
                folder = key;
                break;
            }
        }

        const newFolder = path.join(folderPath, folder);

        if(!fs.existsSync(newFolder)){
            fs.mkdirSync(newFolder);
            logger.emit('log', `${folder} created at ${folderPath}`, folderPath);
        }

        const oldPath = path.join(folderPath, file.toString());
        const newPath = path.join(newFolder, file.toString());

        if(fs.lstatSync(oldPath).isFile()){
            try{
                fs.renameSync(oldPath, newPath);
                logger.emit('log', `${file} moved to ${folder}`, folderPath);
            }
            catch(err){
                logger.emit('log', `Error in moving ${file} to ${folder}: ${err}`, folderPath);
            }
        }
    });
};

process.stdin.on('data', (input) => {
    const folderPath = input.toString().trim();

    if(!fs.existsSync(folderPath)) {
        console.log('❌ Folder does not exist');
        process.exit();
    }

    organizer(folderPath);
    process.stdin.pause();
});

