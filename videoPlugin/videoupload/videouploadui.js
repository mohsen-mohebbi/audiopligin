import { Plugin } from 'ckeditor5/src/core';
import { FileDialogButtonView } from 'ckeditor5/src/upload';
import videoUploadIcon from '../../theme/icons/video.svg';
import {createVideoTypeRegExp} from "./utils";

export default class VideoUploadUI extends Plugin {
    init() {
        const editor = this.editor;
        const t = editor.t;

        const componentCreator = locale => {
            const view = new FileDialogButtonView( locale );
            const command = editor.commands.get('uploadVideo');
            const videoTypes = editor.config.get('video.upload.types');
            const videoMediaTypesRegExp = createVideoTypeRegExp(videoTypes);

            view.set({
                acceptedType: videoTypes.map(type => `video/${type}`).join(','),
                allowMultipleFiles: editor.config.get('video.upload.allowMultipleFiles')
            });

            view.buttonView.set({
                label: t('آپلود ویدیو'),
                icon: videoUploadIcon,
                tooltip: true
            });


            view.buttonView.bind('isEnabled').to(command);

            view.on('done', (evt, files) => {
                document.getElementById('advancedsource').value="";
                localStorage.setItem("videoupload","true");
                const videosToUpload = Array.from(files).filter(file => videoMediaTypesRegExp.test(file.type));

                if (videosToUpload.length) {
                    editor.execute('uploadVideo', { files: videosToUpload });
                }
            });

            return view;
        };

        editor.ui.componentFactory.add( 'uploadVideo', componentCreator );
        editor.ui.componentFactory.add( 'videoUpload', componentCreator );
    }
}
