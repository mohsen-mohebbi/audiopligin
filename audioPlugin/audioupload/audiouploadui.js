import { Plugin } from 'ckeditor5/src/core';
import { FileDialogButtonView } from 'ckeditor5/src/upload';
import audioUploadIcon from '../../theme/icons/audio.svg';
import {createAudioTypeRegExp} from "./utils";

export default class AudioUploadUI extends Plugin {
    init() {
        const editor = this.editor;
        const t = editor.t;

        const componentCreator = locale => {
            const view = new FileDialogButtonView( locale );
            const command = editor.commands.get('uploadAudio');
            const audioTypes = editor.config.get('audio.upload.types');
            const audioMediaTypesRegExp = createAudioTypeRegExp(audioTypes);

            view.set({
                acceptedType: audioTypes.map(type => `audio/${type}`).join(','),
                allowMultipleFiles: editor.config.get('audio.upload.allowMultipleFiles')
            });

            view.buttonView.set({
                label: t('آپلود صوت'),
                icon: audioUploadIcon,
                tooltip: true
            });


            view.buttonView.bind('isEnabled').to(command);

            view.on('done', (evt, files) => {
                document.getElementById('advancedsource').value="";
                localStorage.setItem("audioupload","true");
                const audiosToUpload = Array.from(files).filter(file => audioMediaTypesRegExp.test(file.type));

                if (audiosToUpload.length) {
                    editor.execute('uploadAudio', { files: audiosToUpload });
                }
            });

            return view;
        };

        editor.ui.componentFactory.add( 'uploadAudio', componentCreator );
        editor.ui.componentFactory.add( 'audioUpload', componentCreator );
    }
}