 
import styles from './index.module.less';
import {useContext} from 'react';
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { FloatButton } from 'antd';
import { AppContext } from "../App";
import { EToolsKey, AppliancePluginInstance } from '@netless/appliance-plugin';
import { ClickerIcon, LaserPenIcon, SelectorIcon, TextIcon } from '../assets/svg';
import { PencilTools } from '../pencilTools';
import { GeometryButtons } from '../geometryTools';
import { ImageButtons } from '../imageTools';
import React from 'react';
import { AppButtons } from '../appTools';
import { EraserButtons } from '../eraserTools';
import { RenderButtons } from '../renderTools';
export const FloatTools = () => {
    const {toolsKey, setToolsKey, preViewRef} = useContext(AppContext);
    function blobCallback(iconName:string, canvas: HTMLCanvasElement) {
        return (b:Blob | null) => {
            if(b){
                const a = document.createElement("a");
                a.textContent = "下载";
                document.body.appendChild(a);
                a.style.display = "block";
                a.download = `${iconName}.png`;
                a.href = window.URL.createObjectURL(b);
                a.click();
                a.remove();
                canvas.remove();
            }
        };
    }
    return (
        <div className={styles['FloatTools']}>
            <FloatButton.Group shape="square" style={{ left: 20, bottom: '20%', width: 40 }}>
                <FloatButton type={toolsKey === EToolsKey.Clicker ?'primary':'default'} icon={<ClickerIcon />} onClick={()=>{
                    setToolsKey(EToolsKey.Clicker)
                }}/>
                <FloatButton type={toolsKey === EToolsKey.Selector ?'primary':'default'} icon={<SelectorIcon />} onClick={()=>{
                    setToolsKey(EToolsKey.Selector)
                }}/>
                <FloatButton type={toolsKey === EToolsKey.Pencil?'primary':'default'} icon={<EditOutlined />} onClick={()=>{
                    setToolsKey(EToolsKey.Pencil)
                }}/>
                <FloatButton type={toolsKey === EToolsKey.LaserPen?'primary':'default'} icon={<LaserPenIcon />} onClick={()=>{
                    setToolsKey(EToolsKey.LaserPen)
                }}/>
                <EraserButtons/>
                <GeometryButtons/>
                <ImageButtons/>
                <FloatButton 
                    type={toolsKey === EToolsKey.Text?'primary':'default'} 
                    icon={<TextIcon style={{color:toolsKey === EToolsKey.Text?'white':'black' }}  />} 
                    onClick={()=>{
                        setToolsKey(EToolsKey.Text)
                    }}
                />
                {
                    window.manager && <AppButtons/>
                }
                <FloatButton 
                    type={'default'} 
                    icon={<DeleteOutlined/>} 
                    onClick={()=>{
                        window.room.cleanCurrentScene();
                    }}
                />
                <FloatButton 
                    type={'default'} 
                    icon={<DownloadOutlined />} 
                    onClick={async ()=>{
                        const width =  window.manager && window.manager.mainView.size.width || window.room.state.cameraState.width;
                        const height =  window.manager && window.manager.mainView.size.height || window.room.state.cameraState.height;
                        const scenePath = window.manager && window.manager.mainView.focusScenePath || window.room.state.sceneState.scenePath;
                        const rect = await window.room.getBoundingRectAsync(scenePath);
                        let w = Math.max(rect?.width, width);
                        let h = Math.max(rect?.height, height);
                        let scale:number = 1;
                        const scaleW = w > 5 * 1024 && Math.min(5* 1024 / w, scale) || scale;
                        const scaleH = h > 5 * 1024 && Math.min(5 * 1024 / h, scale) || scale;
                        if (scaleW <= scaleH) {
                            w = scaleW < 1 && 5 * 1024 || w;
                            h = Math.floor(h * scaleW)+1;
                            scale = scaleW;
                        } else if (scaleW > scaleH) {
                            h = scaleH < 1 && 5 * 1024 || h;
                            w = Math.floor(w * scaleH)+1;
                            scale = scaleH;
                        }
                        const centerCamera = {
                            scale,
                            centerX: rect.originX + rect.width / 2,
                            centerY: rect.originY + rect.height / 2,
                        }
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d");
                        canvas.width = w;
                        canvas.height = h;
                        context && await window.room.screenshotToCanvasAsync(context, scenePath, w, h, centerCamera, devicePixelRatio);
                        canvas.toBlob(blobCallback(window.room.uid, canvas), "image/png")
                    }}
                />
                <FloatButton 
                    type={'default'} 
                    icon={<PictureOutlined />} 
                    onClick={()=>{
                        // const scenePath = window.manager && window.manager.mainView.focusScenePath || window.room.state.sceneState.scenePath;
                        if (preViewRef.current) {
                            const div = preViewRef.current;
                            if (div.style.display === "block") {
                                div.style.display = "none";
                                (window.appliancePlugin as AppliancePluginInstance).destroyMiniMap('mainView')
                            } else {
                                div.style.display = "block";
                                // window.room.fillSceneSnapshotAsync(scenePath, div, document.body.clientWidth, document.body.clientHeight);
                                (window.appliancePlugin as AppliancePluginInstance).createMiniMap('mainView', div)
                            }
                        }  
                    }}
                />
                <RenderButtons/>
                {
                    (toolsKey === EToolsKey.Pencil || toolsKey === EToolsKey.LaserPen) && <PencilTools/>
                }
            </FloatButton.Group>
        </div>
    )
}