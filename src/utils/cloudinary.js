import {v2} from 'cloudinary';
import fs from 'fs';

cloudinary.uploader
  .upload("my_image.jpg")
  .then(result=>console.log(result));