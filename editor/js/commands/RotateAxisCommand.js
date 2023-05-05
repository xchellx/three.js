import { Command } from '../Command.js';
import { Vector3 } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param axis string
 * @param newRotation number
 * @constructor
 */
class RotateAxisCommand extends Command {
    constructor(editor, object, axis, newRotation) {
        super(editor);
        
        this.type = 'RotateAxisCommand';
        this.name = 'Rotate Axis';
        this.updatable = true;
        
        this.object = object;
        
        this.axis = axis;
        
        if (object !== undefined && newRotation !== undefined) {
            this.oldRotation = object.quaternion.clone();
            this.newRotation = newRotation;
        }
    }

    execute() {
        switch (this.axis) {
            case 'X':
                this.object.rotateOnAxis(new Vector3(1, 0, 0), this.newRotation);
                break;
            case 'Y':
                this.object.rotateOnAxis(new Vector3(0, 1, 0), this.newRotation);
                break;
            case 'Z':
                this.object.rotateOnAxis(new Vector3(0, 0, 1), this.newRotation);
                break;
        }
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    undo() {
        this.object.quaternion.copy(this.oldRotation);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    update(command) {
        this.newRotation = command.newRotation;
    }

    toJSON() {
        const output = super.toJSON(this);
        
        output.objectUuid = this.object.uuid;
        output.axis = this.axis;
        output.oldRotation = this.oldRotation;
        output.newRotation = this.newRotation;
        
        return output;
    }

    fromJSON( json ) {
        super.fromJSON(json);
        
        this.object = this.editor.objectByUuid(json.objectUuid);
        this.axis = json.axis;
        this.oldRotation = json.oldRotation;
        this.newRotation = json.newRotation;
    }

}

export { RotateAxisCommand };
