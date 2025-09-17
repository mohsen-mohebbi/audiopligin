import { Plugin } from 'ckeditor5/src/core';
import AudioUploadUI from "./audioupload/audiouploadui";
import AudioUploadEditing from "./audioupload/audiouploadediting";
import AudioUploadProgress from "./audioupload/audiouploadprogress";

export default class AudioUpload extends Plugin {
    static get requires() {
        return [AudioUploadEditing, AudioUploadUI, AudioUploadProgress];
    }
}