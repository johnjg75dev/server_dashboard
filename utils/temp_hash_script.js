// temp_hash_script.js
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('admin', salt); // Replace 'admin' with your desired password
console.log(hash);