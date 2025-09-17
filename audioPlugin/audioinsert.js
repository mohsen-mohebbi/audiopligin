import { Plugin } from 'ckeditor5/src/core';
import AudioUpload from './audioupload';
import AudioInsertUI from './audioinsert/audioinsertui';

export default class AudioInsert extends Plugin {
    static get pluginName() {
        return 'AudioInsert';
    }

    static get requires() {
        return [ AudioUpload, AudioInsertUI ];
    }
}