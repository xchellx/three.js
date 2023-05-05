import { Box3, Vector3 } from 'three';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { RotateAxisCommand } from './commands/RotateAxisCommand.js';

function MenubarEdit( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/edit' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Undo

	const undo = new UIRow();
	undo.setClass( 'option' );
	undo.setTextContent( strings.getKey( 'menubar/edit/undo' ) );
	undo.onClick( function () {

		editor.undo();

	} );
	options.add( undo );

	// Redo

	const redo = new UIRow();
	redo.setClass( 'option' );
	redo.setTextContent( strings.getKey( 'menubar/edit/redo' ) );
	redo.onClick( function () {

		editor.redo();

	} );
	options.add( redo );

	// Clear History

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clear_history' ) );
	option.onClick( function () {

		if ( confirm( 'The Undo/Redo History will be cleared. Are you sure?' ) ) {

			editor.history.clear();

		}

	} );
	options.add( option );


	editor.signals.historyChanged.add( function () {

		const history = editor.history;

		undo.setClass( 'option' );
		redo.setClass( 'option' );

		if ( history.undos.length == 0 ) {

			undo.setClass( 'inactive' );

		}

		if ( history.redos.length == 0 ) {

			redo.setClass( 'inactive' );

		}

	} );

	// ---

	options.add( new UIHorizontalRule() );

	// Center

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/center' ) );
	option.onClick( function () {

		const object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid centering the camera or scene

		const aabb = new Box3().setFromObject( object );
		const center = aabb.getCenter( new Vector3() );
		const newPosition = new Vector3();

		newPosition.x = object.position.x + ( object.position.x - center.x );
		newPosition.y = object.position.y + ( object.position.y - center.y );
		newPosition.z = object.position.z + ( object.position.z - center.z );

		editor.execute( new SetPositionCommand( editor, object, newPosition ) );

	} );
	options.add( option );

	// Clone

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clone' ) );
	option.onClick( function () {

		let object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.execute( new AddObjectCommand( editor, object ) );

	} );
	options.add( option );

	// Delete

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/delete' ) );
	option.onClick( function () {

		const object = editor.selected;

		if ( object !== null && object.parent !== null ) {

			editor.execute( new RemoveObjectCommand( editor, object ) );

		}

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Set textures to sRGB. See #15903

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/fixcolormaps' ) );
	option.onClick( function () {

		editor.scene.traverse( fixColorMap );

	} );
	options.add( option );

    // Get Basis Translation
    
    option = new UIRow();
    option.setClass("option");
    option.setTextContent( strings.getKey("menubar/edit/getbasistrans"));
    option.onClick( function () {
        const obj = editor.selected;
        if (obj !== null) {
            const athv = new DataView(new ArrayBuffer(4));
            function ath(a, v) {
                return a.reduce((a, o) => {
                    v.setFloat32(0, o, false);
                    return a + Array.apply(null, { length: 4 })
                        .map((_, i) => v.getUint8(i).toString(16).toUpperCase().padStart(2, "0"))
                        .join('') + " ";
                }, "");
            }
            
            const trans = [obj.matrix.elements[12], obj.matrix.elements[13], obj.matrix.elements[14]];
            const orient = [
                obj.matrix.elements[0], obj.matrix.elements[4], obj.matrix.elements[8],
                obj.matrix.elements[1], obj.matrix.elements[5], obj.matrix.elements[9],
                obj.matrix.elements[2], obj.matrix.elements[6], obj.matrix.elements[10]
            ];
            window.alert(`- ${obj.name}\n- ${ath(trans, athv)}\n- ${ath(orient, athv)}`);
        }
    } );
    options.add(option);

    // Fix Camera
    
    function fixUnfixCamera(fixOrUnfix) {
        const obj = editor.selected;
        if (obj !== null) {
            if (obj.isPerspectiveCamera || obj.isOrthographicCamera) {
                editor.execute(new RotateAxisCommand(editor, obj, "X", fixOrUnfix ? THREE.MathUtils.degToRad(90) : THREE.MathUtils.degToRad(-90)));
                obj.updateProjectionMatrix();
            } else
                window.alert("Please select a camera...");
        }
    }
    
    option = new UIRow();
    option.setClass("option");
    option.setTextContent( strings.getKey("menubar/edit/fixcam"));
    option.onClick( function () { fixUnfixCamera(true); } );
    options.add(option);

    // Unfix Camera
    
    option = new UIRow();
    option.setClass("option");
    option.setTextContent( strings.getKey("menubar/edit/unfixcam"));
    option.onClick( function () { fixUnfixCamera(false); } );
    options.add(option);

	const colorMaps = [ 'map', 'envMap', 'emissiveMap' ];

	function fixColorMap( obj ) {

		const material = obj.material;

		if ( material !== undefined ) {

			if ( Array.isArray( material ) === true ) {

				for ( let i = 0; i < material.length; i ++ ) {

					fixMaterial( material[ i ] );

				}

			} else {

				fixMaterial( material );

			}

			editor.signals.sceneGraphChanged.dispatch();

		}

	}

	function fixMaterial( material ) {

		let needsUpdate = material.needsUpdate;

		for ( let i = 0; i < colorMaps.length; i ++ ) {

			const map = material[ colorMaps[ i ] ];

			if ( map ) {

				map.encoding = THREE.sRGBEncoding;
				needsUpdate = true;

			}

		}

		material.needsUpdate = needsUpdate;

	}

	return container;

}

export { MenubarEdit };
