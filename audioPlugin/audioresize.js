import { Plugin } from 'ckeditor5/src/core';
import AudioResizeEditing from "./audioresize/audioresizeediting";
import AudioResizeHandles from "./audioresize/audioresizehandles";
import AudioResizeButtons from "./audioresize/audioresizebuttons";
import '../theme/audioresize.css';

export default class AudioResize extends Plugin {
    static get requires() {
        return [ AudioResizeEditing, AudioResizeHandles, AudioResizeButtons ];
    }

    static get pluginName() {
        return 'AudioResize';
    }
}