import { Command } from '../Command.js';
import { Matrix4 } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMatrix4 THREE.Matrix4
 * @param optionalOldMatrix4 THREE.Matrix4
 * @constructor
 */
class ApplyMatrix4Command extends Command {
    constructor(editor, object, newMatrix4, optionalOldMatrix4) {
        super(editor);
        
        this.type = 'ApplyMatrix4Command';
        this.name = 'Apply Matrix4';
        this.updatable = true;
        
        this.object = object;
        
        if (object !== undefined && newMatrix4 !== undefined) {
            this.oldMatrix4 = object.matrix.clone();
            this.newMatrix4 = newMatrix4.clone();
        }
        
        if (optionalOldMatrix4 !== undefined)
            this.oldMatrix4 = optionalOldMatrix4.clone();
    }

    execute() {
        this.object.applyMatrix4(this.newMatrix4);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    undo() {
        this.object.applyMatrix4(this.oldMatrix4);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    update(command) {
        this.newMatrix4.copy(command.newMatrix4);
    }

    toJSON() {
        const output = super.toJSON(this);
        
        output.objectUuid = this.object.uuid;
        output.oldMatrix4 = this.oldMatrix4.toArray();
        output.newMatrix4 = this.newMatrix4.toArray();
        
        return output;
    }

    fromJSON( json ) {
        super.fromJSON(json);
        
        this.object = this.editor.objectByUuid(json.objectUuid);
        this.oldMatrix4 = new Matrix4().fromArray(json.oldMatrix4);
        this.newMatrix4 = new Matrix4().fromArray(json.newMatrix4);
    }

}

export { ApplyMatrix4Command };
