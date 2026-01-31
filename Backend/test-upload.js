const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream('package.json')); // Используем package.json как тестовый файл
        form.append('path', 'test');

        const response = await axios.post('http://localhost:3000/storage/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Upload successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Тестируем presigned URL
        if (response.data.presignedUrl) {
            console.log('\nTesting presigned URL...');
            const downloadResponse = await axios.get(response.data.presignedUrl);
            console.log('Presigned URL works! File size:', downloadResponse.data.length);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testUpload();
