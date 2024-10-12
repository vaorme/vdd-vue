function slugify(text) {
	return text.toString().toLowerCase()
	.replace(/\s+/g, '-')
	.replace(/[^\w\-]+/g, '')
	.replace(/\-\-+/g, '-')
	.replace(/^-+/, '')
	.replace(/-+$/, '');
}
function humanizeFileSize(bytes) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	if (bytes === 0) return '0 Bytes';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
function isImage(extension) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'heif', 'heic', 'ico'];
	if(!extension){
		return false;
	}
    const ext = extension.toLowerCase();
    return imageExtensions.includes(ext);
}
export { slugify, humanizeFileSize, isImage };