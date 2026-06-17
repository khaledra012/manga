const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function main() {
    const filePath = 'G:\\بلو لووك\\350\\2.jpg';
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    console.log(`Image size: ${width}x${height}`);

    // Let's analyze the bottom region: y from height - 150 to height - 30
    // and x from width - 300 to width - 50
    const startY = height - 150;
    const endY = height - 20;
    const startX = width - 350;
    const endX = width - 20;

    console.log(`Checking bottom-right region (X: ${startX}-${endX}, Y: ${startY}-${endY})`);

    // Let's print out rows where we have consecutive bright pixels
    // or let's count bright pixels in this region
    let brightCount = 0;
    for (let y = startY; y < endY; y++) {
        let line = '';
        for (let x = startX; x < endX; x++) {
            const idx = (y * width + x) * 4;
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            
            // If it is very bright (white text)
            if (r > 240 && g > 240 && b > 240) {
                line += '#';
                brightCount++;
            } else {
                line += ' ';
            }
        }
        if (line.trim().length > 0) {
            console.log(`Y=${y} (offset ${y - startY}): ${line}`);
        }
    }
    console.log(`Total bright pixels in region: ${brightCount}`);
}

main();
