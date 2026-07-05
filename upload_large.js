const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'uohqyl93',
  api_key: '545344581256144',
  api_secret: 'oiMpmIPOfK09ITquByiL5kGOPHE',
  secure: true,
});

async function main() {
  try {
    const fullPath = 'public/event/videos/Rahul Ravindran.mp4';
    console.log(`Uploading ${fullPath}...`);
    const result = await cloudinary.uploader.upload_large(fullPath, {
      resource_type: "auto",
      folder: 'raobahadur/event/videos',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    console.log(`Uploaded to ${result.secure_url}`);

    // update mappings
    const mappings = JSON.parse(fs.readFileSync('cloudinary_mappings.json', 'utf8'));
    const localPath = fullPath.replace('public', '').replace(/\\/g, '/');
    mappings[localPath] = result.secure_url;
    fs.writeFileSync('cloudinary_mappings.json', JSON.stringify(mappings, null, 2));
    console.log('Mappings updated');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
