import {
	BufferAttribute,
	BufferGeometry,
	FileLoader,
	Float32BufferAttribute,
	Loader,
	Vector3
} from 'three';

import { BufferStreamOptions, BufferStream } from "three/addons/libs/buffer-stream-js/buffer-stream-js.js";
import { toTrianglesDrawMode, mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Based on STLLoader
class FRMELoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( data ) {

        // Common colors
        const clGrey = 0x808080,
            clWhite = 0xFFFFFF,
            clBlack = 0x000000,
            clYellow = 0xFFFF00,
            clGreen = 0x00FF00,
            clOrange = 0xFF8000,
            clAqua = 0x00FFFF,
            clRed = 0xFF0000,
            clBlue = 0x0000FF,
            clMagenta = 0xFF007F,
            clPurple = 0x7F00FF,
            clPink = 0xFF00FF;
        
        // CAMR Projection types
        const CAMRProj_Perspective = 0x00,
            CAMRProj_Orthographic = 0x01;
        
        // GX opcodes
        const GX_NOP = 0x00,
            GX_DRAW_TRIANGLES = 0x90,
            GX_DRAW_TRIANGLE_STRIP = 0x98,
            GX_DRAW_TRIANGLE_FAN = 0xA0;
        
        function createCube(w, h, d, c, g) {
            const geometry = new THREE.BoxGeometry(w, h, d);
            return (g ?? false)
                ? geometry
                : new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ "color": c }));
        }
        
        function createPlane(vc, va, uc, ua, c) {
            const vb = new Float32Array(vc * 3);
            let vi = 0;
            for (const v of va) {
                vb.set(v, vi);
                vi += 3;
            }
            
            const ub  = new Float32Array(uc * 2);
            let ui = 0;
            for (const u of ua) {
                ub.set(u, ui);
                ui += 2;
            }
            
            let geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(vb, 3));
            geometry.setAttribute("uv", new THREE.BufferAttribute(ub, 2));
            geometry = toTrianglesDrawMode(geometry, THREE.TriangleStripDrawMode);
            geometry.computeVertexNormals();
            
            return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ "color": c, "side": THREE.DoubleSide }));
        }
        
        function gotoNextSection(reader, sectionTracker, sectionSizes) {
            reader.seek(sectionTracker.nextOffs);
            sectionTracker.curOffs = reader.offset;
            sectionTracker.curSection += 1;
            sectionTracker.nextOffs = sectionTracker.curOffs + sectionSizes[sectionTracker.curSection];
        }
        
        function readHMDL(reader, allocSize, modelCount, sectionCount) {
            const sectionSizes = [];
            for (let i = 0; i < sectionCount; i++)
                sectionSizes.push(reader.readUInt32BE());
            
            const modelStart = reader.offset;
            const sectionTracker = {
                "curOffs": reader.offset,
                "curSection": 0,
                "nextOffs": reader.offset + sectionSizes[0]
            };
            
            const objects = [];
            
            // Material Set - Section: 0
            // HMDLs have no CMDL header, therefore they cannot specify a material set count. Therefore, the material
            // set count in HMDLs are always 1.
            const txtrIdCount = reader.readUInt32BE();
            for (let i2 = 0; i2 < txtrIdCount; i2++)
                reader.skip(4);
            
            const materialCount = reader.readUInt32BE();
            const materialEndOffsets = [];
            for (let i2 = 0; i2 < materialCount; i2++)
                materialEndOffsets.push(reader.readUInt32BE());
            
            const materials = [];
            let materialStart = reader.offset;
            for (let i2 = 0; i2 < materialCount; i2++) {
                const material = {};
                
                const materialFlags = reader.readUInt32BE();
                
                const textureIndicesCount = reader.readUInt32BE();
                for (let i3 = 0; i3 < textureIndicesCount; i3++)
                    reader.skip(4);
                
                material.vtxAttrFlags = reader.readUInt32BE();
                
                // MP2 has two uint32s here but MP2Demo does not.
                // However, they do exist in MP2Demo HMDLs (this is what the 8 is).
                reader.skip(8 + 4);
                
                const enableKonst = ((materialFlags & 0x8) >>> 0) === 0x8;
                if (enableKonst) {
                    const konstColorCount = reader.readUInt32BE();
                    for (let i3 = 0; i3 < konstColorCount; i3++)
                        reader.skip(4);
                }
                
                reader.skip(4);
                
                const enableReflectionIndStage = ((materialFlags & 0x400) >>> 0) === 0x400;
                if (enableReflectionIndStage)
                    reader.skip(4);
                
                const colorChannelCount = reader.readUInt32BE();
                for (let i3 = 0; i3 < colorChannelCount; i3++)
                    reader.skip(4);
                
                const tevStageCount = reader.readUInt32BE();
                for (let i3 = 0; i3 < tevStageCount; i3++)
                    reader.skip(20);
                
                for (let i3 = 0; i3 < tevStageCount; i3++)
                    reader.skip(4);
                
                const texGenCount = reader.readUInt32BE();
                for (let i3 = 0; i3 < texGenCount; i3++)
                    reader.skip(4);
                
                const uvAnimsSize = reader.readUInt32BE();
                const uvAnimsStart = reader.offset;
                const uvAnimsCount = reader.readUInt32BE();
                for (let i3 = 0; i3 < uvAnimsCount; i3++) {
                    const uvAnimationType = reader.readUInt32BE();
                    switch (uvAnimationType) {
                        case 2:
                            reader.skip(16);
                            break;
                        case 3:
                            reader.skip(8);
                            break;
                        case 4:
                            reader.skip(16);
                            break;
                        case 5:
                            reader.skip(16);
                            break;
                        case 7:
                            reader.skip(8);
                            break;
                    }
                }
                
                if ((reader.offset - uvAnimsStart) !== uvAnimsSize)
                    throw new Error(`#${i} Read past UVAnimation size ${uvAnimsSize} for material #${i2}}.`);
                
                materials.push(material);
                
                reader.seek(materialStart + materialEndOffsets[i2]);
            }
            
            // HDML only has one batch of material section(s) like CMDL
            // However, the following sections typical in CMDL are repeated for every model up until the model count.
            const modelSectionCount = modelCount - 1;
            for (let i = 0; i < modelCount; i++) {
                if (i > modelSectionCount) {
                    // Can this even happen? Not sure but just to be safe, this is here.
                    console.warn(`Model count exceeds model section count: there may be MODLs with a direct CMDL \
reference instead of a model index, causing an imblanence with the model count. ${i}/${modelSectionCount}`);
                    break;
                }
                
                // Vertices - Section: 1
                gotoNextSection(reader, sectionTracker, sectionSizes);
                const vertices = [];
                for (let i2 = 0; i2 < (sectionSizes[sectionTracker.curSection] / (4 * 3)); i2++)
                    vertices.push([reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()]);
                
                // Normals - Section: 2
                // HDML always has short normals, in fact it cannot specify if it does not have them because HDML has
                // no CMDL header and therefore no flags to specify if it does not have them. Therefore, the normals
                // are always 16bit floats.
                gotoNextSection(reader, sectionTracker, sectionSizes);
                const normals = [];
                for (let i2 = 0; i2 < (sectionSizes[sectionTracker.curSection] / (2 * 3)); i2++)
                    normals.push([reader.readUInt16BE(), reader.readUInt16BE(), reader.readUInt16BE()]);
                
                // Colors - Section: 3
                // This data is actually used in some HDMLs, despite CMDLs never using it. However, unless we care
                // about vertex colors, it is useless to us.
                gotoNextSection(reader, sectionTracker, sectionSizes);
                for (let i2 = 0; i2 < (sectionSizes[sectionTracker.curSection] / (1 * 4)); i2++)
                    reader.skip(4);
                
                // UVs - Section: 4
                gotoNextSection(reader, sectionTracker, sectionSizes);
                const uvs = [];
                for (let i2 = 0; i2 < (sectionSizes[sectionTracker.curSection] / (4 * 2)); i2++)
                    uvs.push([reader.readFloatBE(), reader.readFloatBE()]);
                
                // Short UVs - Section: 5
                // HDML does not have sort uvs, in fact it cannot because HDML has no CMDL header and therefore no
                // flags to specify if it does have them. However, the section size for it is still there, so we
                // must "pretend" to read it, even if it always 0 for the section size.
                gotoNextSection(reader, sectionTracker, sectionSizes);
                for (let i2 = 0; i2 < (sectionSizes[sectionTracker.curSection] / (2 * 2)); i2++)
                    reader.skip(4);
                
                // Surface End Offsets - Section: 6
                gotoNextSection(reader, sectionTracker, sectionSizes);
                const surfaceEndOffsetCount = reader.readUInt32BE();
                const surfaceEndOffsets = [];
                for (let i2 = 0; i2 < surfaceEndOffsetCount; i2++)
                    surfaceEndOffsets.push(reader.readUInt32BE());
                
                // Surfaces - Section: 7 to Surface Offset Count
                const surfaces = [];
                for (let i2 = 0; i2 < surfaceEndOffsetCount; i2++) {
                    gotoNextSection(reader, sectionTracker, sectionSizes);
                    
                    const surface = {};
                    
                    surface.pivot = [reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()];
                    const materialID = reader.readUInt32BE();
                    
                    // Surface settings from material vertex format flags
                    const curMat = materials[materialID];
                    if (typeof (curMat ?? undefined) === "undefined")
                        throw new Error(`#${i} Invalid Surface Material ID ${materialID} at surface #${i2}`);
                    
                    const displayListFlags = reader.readUInt32BE();
                    const displayListSize = (displayListFlags & 0x7FFFFFFF) >>> 0;
                    
                    reader.skip(8);
                    const extraDataSize = reader.readUInt32BE();
                    // The 4 is MP2 stuff, which does exist in MP2Demo HMDLs (not sure about CMDLs)
                    reader.skip(12 + 4 + extraDataSize);
                    
                    // 32byte alignment
                    reader.seek((reader.offset + 31) & ~31);
                    
                    surface.primitives = [];
                    const displayListStart = reader.offset;
                    while (reader.offset < displayListStart + displayListSize) {
                        const primitive = {};
                        primitive.vertices = [];
                        primitive.normals = [];
                        primitive.uvs = [];
                        
                        // The display list size includes GX_NOP calls, it does not stop at that.
                        const primitiveFlags = reader.readUInt8();
                        primitive.primitiveType = (primitiveFlags & 0xF8) >>> 0;
                        if (primitive.primitiveType !== GX_DRAW_TRIANGLES 
                        && primitive.primitiveType !== GX_DRAW_TRIANGLE_STRIP
                        && primitive.primitiveType !== GX_DRAW_TRIANGLE_FAN
                        && primitive.primitiveType !== GX_NOP) {
                            // This is not a big deal: The game only ever uses triangles, triangle strips, and triangle
                            // fans. See: https://wiki.axiodl.com/w/Geometry_(Metroid_Prime)#Surface
                            console.warn(`#${i} Unsupported primitive type ${primitive.primitiveType} at surface \
#${i2}. This primitive will be read but not parsed.`);
                            primitive.supported = false;
                        } else
                            primitive.supported = true;
                        if (primitive.primitiveType !== GX_NOP) {
                            const vertexCount = reader.readUInt16BE();
                            for (let i3 = 0; i3 < vertexCount; i3++) {
                                // Vertex matrix
                                const pnMtxIdx = ((curMat.vtxAttrFlags & 0x1000000) >>> 0) === 0x1000000;
                                if (pnMtxIdx)
                                    reader.skip(1);
                                
                                // UV matrix
                                const tex0MtxIdx = ((curMat.vtxAttrFlags & 0x2000000) >>> 0) === 0x2000000;
                                const tex1MtxIdx = ((curMat.vtxAttrFlags & 0x4000000) >>> 0) === 0x2000000;
                                const tex2MtxIdx = ((curMat.vtxAttrFlags & 0x8000000) >>> 0) === 0x2000000;
                                const tex3MtxIdx = ((curMat.vtxAttrFlags & 0x10000000) >>> 0) === 0x10000000;
                                const tex4MtxIdx = ((curMat.vtxAttrFlags & 0x20000000) >>> 0) === 0x20000000;
                                const tex5MtxIdx = ((curMat.vtxAttrFlags & 0x40000000) >>> 0) === 0x40000000;
                                const tex6MtxIdx = ((curMat.vtxAttrFlags & 0x80000000) >>> 0) === 0x80000000;
                                if (tex0MtxIdx)
                                    reader.skip(1);
                                if (tex1MtxIdx)
                                    reader.skip(1);
                                if (tex2MtxIdx)
                                    reader.skip(1);
                                if (tex3MtxIdx)
                                    reader.skip(1);
                                if (tex4MtxIdx)
                                    reader.skip(1);
                                if (tex5MtxIdx)
                                    reader.skip(1);
                                if (tex6MtxIdx)
                                    reader.skip(1);
                                
                                // Vertex index
                                const pos = ((curMat.vtxAttrFlags & 0x3) >>> 0) === 0x3;
                                if (pos)
                                    primitive.vertices.push(vertices[reader.readUInt16BE()]);
                                else
                                    primitive.vertices.push([0.0, 0.0, 0.0]);
                                
                                // Normal index
                                const nrm = ((curMat.vtxAttrFlags & 0xC) >>> 0) === 0xC;
                                if (nrm)
                                    primitive.normals.push(normals[reader.readUInt16BE()]);
                                else
                                    primitive.normals.push([0.0, 0.0, 0.0]);
                                
                                // Color 0 index
                                const clr0 = ((curMat.vtxAttrFlags & 0x30) >>> 0) === 0x30;
                                if (clr0)
                                    reader.skip(2);
                                
                                // Color 1 index
                                const clr1 = ((curMat.vtxAttrFlags & 0xC0) >>> 0) === 0xC0;
                                if (clr1)
                                    reader.skip(2);
                                
                                // UV index
                                const tex0 = ((curMat.vtxAttrFlags & 0x300) >>> 0) === 0x300;
                                const tex1 = ((curMat.vtxAttrFlags & 0xC00) >>> 0) === 0xC00;
                                const tex2 = ((curMat.vtxAttrFlags & 0x3000) >>> 0) === 0x3000;
                                const tex3 = ((curMat.vtxAttrFlags & 0xC000) >>> 0) === 0xC000;
                                const tex4 = ((curMat.vtxAttrFlags & 0x30000) >>> 0) === 0x30000;
                                const tex5 = ((curMat.vtxAttrFlags & 0xC0000) >>> 0) === 0xC0000;
                                const tex6 = ((curMat.vtxAttrFlags & 0x300000) >>> 0) === 0x300000;
                                if (tex0)
                                    primitive.uvs.push(uvs[reader.readUInt16BE()]);
                                else
                                    primitive.uvs.push([0.0, 0.0]);
                                // Even if UV1 may exist, it is useless. HMDL has no CMDL header so it cannot specify
                                // if it has lightmap UVs in it's flags field. Therefore, UV1 is pointless.
                                if (tex1)
                                    reader.skip(2);
                                if (tex2)
                                    reader.skip(2);
                                if (tex3)
                                    reader.skip(2);
                                if (tex4)
                                    reader.skip(2);
                                if (tex5)
                                    reader.skip(2);
                                if (tex6)
                                    reader.skip(2);
                            }
                        }
                        surface.primitives.push(primitive);
                    }
                    surfaces.push(surface);
                }
                
                let color = clGrey;
                const surfGeoms = [];
                for (const surface of surfaces) {
                    // TODO: surface.pivot
                    const primGeoms = [];
                    for (const primitive of surface.primitives) {
                        if (primitive.primitiveType !== GX_NOP) {
                            let primGeom;
                            if (primitive.supported) {
                                const posArr = primitive.vertices;
                                const nrmArr = primitive.normals;
                                const uvArr = primitive.uvs;
                                
                                const posBuff = new Float32Array(posArr.length * 3);
                                let posIdx = 0;
                                for (const pos of posArr) {
                                    posBuff.set(pos, posIdx);
                                    posIdx += 3;
                                }
                                
                                const nrmBuff = new Float32Array(nrmArr.length * 3);
                                let nrmIdx = 0;
                                for (const nrm of nrmArr) {
                                    nrmBuff.set(nrm, nrmIdx);
                                    nrmIdx += 3;
                                }
                                
                                const uvBuff  = new Float32Array(uvArr.length * 2);
                                let uvIdx = 0;
                                for (const uv of uvArr) {
                                    uvBuff.set(uv, uvIdx);
                                    uvIdx += 2;
                                }
                                
                                primGeom = new THREE.BufferGeometry();
                                primGeom.setAttribute("position", new THREE.BufferAttribute(posBuff, 3));
                                primGeom.setAttribute("normal", new THREE.BufferAttribute(nrmBuff, 3));
                                primGeom.setAttribute("uv", new THREE.BufferAttribute(uvBuff, 2));
                                
                                // Triangulize
                                if (primitive.primitiveType === GX_DRAW_TRIANGLE_STRIP)
                                    primGeom = toTrianglesDrawMode(primGeom, THREE.TriangleStripDrawMode);
                                else if (primitive.primitiveType === GX_DRAW_TRIANGLE_FAN)
                                    primGeom = toTrianglesDrawMode(primGeom, THREE.TriangleFanDrawMode);
                                else {
                                    // GX_DRAW_TRIANGLES does not need to be triangulized but it does have to be
                                    // indexed, as triangulization of the other primitive types index them. This
                                    // is because for merging, all BufferGeometry must be indexed (or not indexed).
                                    // Indexed beats majority here, so this must be indexed. The indices can just
                                    // be incrementive, as there is no reusal of vertices.
                                    const indxCount = posArr.length;
                                    const indxBuff = new Uint8Array(indxCount);
                                    for (let indIdx = 0; indIdx < indxCount; indIdx++)
                                        indxBuff.set(indIdx, indIdx);
                                    
                                    primGeom.setIndex(new THREE.BufferAttribute(indxBuff, 1));
                                }
                            } else {
                                color = clRed;
                                primGeom = createCube(0.2, 0.2, 0.2, 0, true);
                            }
                            primGeoms.push(primGeom);
                        }
                    }
                    surfGeoms.push(mergeGeometries(primGeoms, false));
                }
                objects.push(new THREE.Mesh(mergeGeometries(surfGeoms, false),
                    new THREE.MeshBasicMaterial({ "color": color, "side": THREE.DoubleSide })));
            }
            reader.seek(modelStart + allocSize);
            return objects;
        }
        
        function readFRME(reader) {
            const version = reader.readUInt32BE();
            if (version !== 4)
                throw new Error("Only version 4 is supported for now");
            
            // Usually this is just TXTR and FONT which we dont have to care about here
            const dependencyCount = reader.readUInt32BE();
            for (let i = 0; i < dependencyCount; i++)
                reader.skip(8);
            
            // allocSize is the size of the section data of it's entirity AFTER the section count and the subsequent
            // section sizes (if there are any). This is 0 when modelCount is 0 however we still use it just to be safe
            const allocSize = reader.readUInt32BE();
            const modelCount = reader.readUInt32BE();
            const sectionCount = reader.readUInt32BE();
            const modelStart = reader.offset;
            let models;
            if (modelCount > 0) {
                models = readHMDL(reader, allocSize, modelCount, sectionCount);
            } else
                reader.seek(modelStart + allocSize);
            
            const widgets = {};
            let rootWidget = null;
            
            const widgetCount = reader.readUInt32BE();
            for (let i = 0; i < widgetCount; i++) {
                const widget = {};
                
                const type = reader.readUtf8String(4);
                widget.name = reader.readUtf8String();
                if (widget.name in widgets)
                    throw new Error(`Duplicate names are not allowed: "${widget.name}"`);
                widget.parentName = reader.readUtf8String();
                widget.rootName = "kGSYS_InvalidWidgetID";
                if (widget.parentName === widget.rootName) {
                    if (rootWidget !== null)
                        throw new Error(`There can only be one root widget: "${rootWidget.name}", "${widget.name}"`);
                    else
                        rootWidget = widget;
                }
                reader.skip(24);
                
                switch (type) {
                    case "BWIG":
                        // N/A
                        widget.obj = createCube(0.2, 0.2, 0.2, clWhite);
                        break;
                    case "HWIG":
                        // N/A
                        widget.obj = createCube(0.2, 0.2, 0.2, clBlack);
                        break;
                    case "LITE":
                        reader.skip(32);
                        widget.obj = createCube(0.2, 0.2, 0.2, clYellow);
                        break;
                    case "CAMR":
                        const proj = reader.readUInt32BE();
                        switch (proj) {
                            case CAMRProj_Perspective:
                                const fov1 = reader.readFloatBE();
                                const aspect1 = reader.readFloatBE();
                                const near1 = reader.readFloatBE();
                                const far1 = reader.readFloatBE();
                                widget.obj = new THREE.PerspectiveCamera(fov1, aspect1, near1, far1);
                                break;
                            case CAMRProj_Orthographic:
                                const left2 = reader.readFloatBE();
                                const right2 = reader.readFloatBE();
                                const top2 = reader.readFloatBE();
                                const bottom2 = reader.readFloatBE();
                                const near2 = reader.readFloatBE();
                                const far2 = reader.readFloatBE();
                                widget.obj = new THREE.OrthographicCamera(left2, right2, top2, bottom2, near2, far2);
                                break;
                            default:
                                throw new Error(`Unknown CameraProjection type: \"${proj}\"`);
                        }
                        widget.obj.updateProjectionMatrix();
                        break;
                    case "GRUP":
                        reader.skip(3);
                        widget.obj = createCube(0.2, 0.2, 0.2, clGreen);
                        break;
                    case "PANE":
                        reader.skip(20);
                        widget.obj = createCube(0.2, 0.2, 0.2, clOrange);
                        break;
                    case "IMGP":
                        reader.skip(12);
                        const coordCount1 = reader.readUInt32BE();
                        const coords1 = [];
                        for (let i = 0; i < coordCount1; i++)
                            coords1.push([reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()]);
                        const uvCount1 = reader.readUInt32BE();
                        const uvs1 = [];
                        for (let i = 0; i < uvCount1; i++)
                            uvs1.push([reader.readFloatBE(), reader.readFloatBE()]);
                        widget.obj = createPlane(coordCount1, coords1, uvCount1, uvs1, clGrey);
                        break;
                    case "METR":
                        reader.skip(10);
                        widget.obj = createCube(0.2, 0.2, 0.2, clAqua);
                        break;
                    case "MODL":
                        const cmdlRef = reader.readUInt32BE();
                        const modelIndex = reader.readUInt32BE();
                        reader.skip(4);
                        if (cmdlRef === 0xFFFFFFFF)
                            widget.obj = models[modelIndex];
                        else
                            // TODO: Parse CMDL (is that ever used in MP2?)
                            widget.obj = createCube(0.2, 0.2, 0.2, clRed);
                        break;
                    case "TBGP":
                        reader.skip(1);
                        widget.obj = createCube(0.2, 0.2, 0.2, clBlue);
                        break;
                    case "SLGP":
                        reader.skip(16);
                        widget.obj = createCube(0.2, 0.2, 0.2, clMagenta);
                        break;
                    case "TXPN":
                        reader.skip(118);
                        widget.obj = createCube(0.2, 0.2, 0.2, clPurple);
                        break;
                    case "ENRG":
                        reader.skip(4);
                        widget.obj = createCube(0.2, 0.2, 0.2, clPink);
                        break;
                    case "BMTR":
                        const coordCount2 = reader.readUInt32BE();
                        const coords2 = [];
                        for (let i = 0; i < coordCount2; i++)
                            coords2.push([reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()]);
                        const uvCount2 = reader.readUInt32BE();
                        const uvs2 = [];
                        for (let i = 0; i < uvCount2; i++)
                            uvs2.push([reader.readFloatBE(), reader.readFloatBE()]);
                        reader.skip(4);
                        widget.obj = createPlane(coordCount2, coords2, uvCount2, uvs2, clGrey);
                        break;
                    case "BGND":
                        throw new Error("Unsupported widget type: \"BGND\"");
                    default:
                        throw new Error(`Unknown widget type: "${type}"`);
                }
                widget.obj.name = widget.name;
                
                if (reader.readBoolean())
                    reader.skip(2);
                widget.trans = [reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()];
                widget.orient = [
                    reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE(),
                    reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE(),
                    reader.readFloatBE(), reader.readFloatBE(), reader.readFloatBE()
                ];
                
                widgets[widget.name] = widget;
            }
            
            return widgets;
        }

		function parseBinary( data ) {

			const reader = new BufferStream( data, new BufferStreamOptions( { 'allowExtend': false } ) );
			const widgets = readFRME( reader );
			return widgets;

		}

		function ensureBinary( buffer ) {

			if ( typeof buffer === 'string' ) {

				const array_buffer = new Uint8Array( buffer.length );
				for ( let i = 0; i < buffer.length; i ++ ) {

					array_buffer[ i ] = buffer.charCodeAt( i ) & 0xff; // implicitly assumes little-endian

				}

				return array_buffer.buffer || array_buffer;

			} else {

				return buffer;

			}

		}

		// start

		const binData = ensureBinary( data );

		return parseBinary( binData );

	}

}

export { FRMELoader };
