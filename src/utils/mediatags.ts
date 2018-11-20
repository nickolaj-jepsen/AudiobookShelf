import * as jsmediatags from 'jsmediatags';

export const getMediaTag = new Promise((resolve, reject) => {
    new jsmediatags.Reader('/path/to/song.mp3')
        .read({
            onSuccess: (tag) => {
                console.log('Success!');
                resolve(tag);
            },
            onError: (error) => {
                console.log('Error');
                reject(error);
            }
        });
})