const { exec } = require('child_process');
const path = require('path');

const languages = ['python', 'cpp', 'java'];

languages.forEach(lang => {
    const imageName = `submittery-${lang}-base`;
    const dockerfilePath = path.join(__dirname, 'dockerfiles', `${lang}.Dockerfile`);
    const command = `docker build -t ${imageName} -f ${dockerfilePath} .`;

    console.log(`Building ${imageName}...`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error building ${imageName}:`, stderr);
            return;
        }
        console.log(`Successfully built ${imageName}`);
        console.log(stdout);
    });
});