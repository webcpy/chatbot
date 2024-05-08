const file1 = FileBox.fromUrl('http://qny.webcpy.cn/input.sil');
const base64Data = await file1.toBase64();
const fileBox = FileBox.fromBase64(base64Data, 'input.sil')
  fileBox.mimeType = "audio/silk";
  fileBox.metadata = {
    voiceLength: 3000,
  };
  console.log(contact, fileBox)
  await contact.say(fileBox)