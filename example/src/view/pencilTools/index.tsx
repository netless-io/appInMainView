
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import React, {useContext, useMemo, useState, useEffect} from 'react';
import { StrokePencilIcon, NormPencilIcon, DottedPencilIcon, DottedPencilLongIcon } from '../assets/svg';
import { ColorPicker, Divider, Popover, Button, Slider, Space } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { AppContext } from "../App";
import { EStrokeType, EToolsKey } from '@netless/appliance-plugin';
export const PencilTools = () => {
    const {toolsKey} = useContext(AppContext);
    const [strokeType, setStrokeType] = useState<EStrokeType>(EStrokeType.Stroke);
    useEffect(()=>{
        Promise.resolve().then(()=>{
            const _strokeType = window.room.state.memberState.strokeType;
            if(_strokeType!==strokeType){
                setStrokeType(_strokeType);
            }
        })
    }, [toolsKey, strokeType])

    const _colorPicker = useMemo(() => {
        if(toolsKey === EToolsKey.Pencil || toolsKey === EToolsKey.LaserPen){
            const defaultColor:[number, number, number] = window.room?.state?.memberState?.strokeColor || [0,0,0];
            const opacity: number = window.room?.state?.memberState?.strokeOpacity || 1;
            const defaultValue: any = {a: opacity, b: defaultColor[2], g: defaultColor[1], r: defaultColor[0]};
            const setColorRgb = (color: Color) => {
                const rgba = color.toRgb();
                window.room.setMemberState({strokeColor:[rgba.r,rgba.g,rgba.b], strokeOpacity:rgba.a});
            }
            return (
                <ColorPicker
                    defaultValue={defaultValue}
                    onChangeComplete={setColorRgb}
                    styles={{
                        popupOverlayInner: {
                            width: 280,
                        }
                    }}
                    presets={window.room.floatBarOptions && [
                        {
                            label:'颜色',
                            colors: window.room.floatBarOptions?.colors.map((c: [number,number,number])=>({a:opacity, r:c[0],g:c[1],b:c[2]}))
                        }]}
                    panelRender={(_, { components: { Picker, Presets } }) => (
                        <div
                        className="custom-panel"
                        style={{
                            display: 'flex',
                            width: 280,
                            justifyContent: 'space-between',
                        }}
                        >
                        <div
                            style={{
                                flex: 1,
                            }}
                        >
                            <Presets />
                        </div>
                        <Divider 
                            type="vertical"
                            style={{
                                height: 'auto',
                            }}
                        />
                        <div
                            style={{
                                width: 170,
                            }}
                        >
                            <Picker />
                        </div>
                        </div>
                    )}
                ></ColorPicker>
            )
        }
        return null;
    }, [toolsKey])
    
    const _strokeType = useMemo(() => {
        if(toolsKey === EToolsKey.Pencil || toolsKey === EToolsKey.LaserPen){
            const defaultWidth:number = window.room.state.memberState.strokeWidth;
            const setWidth = (value: number)=>{
                window.room.setMemberState({strokeWidth: value});
            }
            return (
                <Popover
                    placement="rightTop"
                    content={()=>{
                        return (
                            <>
                                <Divider />
                                <Space.Compact size="middle">
                                    {toolsKey === EToolsKey.Pencil && <Button type={strokeType === EStrokeType.Stroke ? 'primary' : 'default'} icon={<StrokePencilIcon />} onClick={()=>{
                                        setStrokeType(EStrokeType.Stroke)
                                        window.room.setMemberState({strokeType:EStrokeType.Stroke});
                                    }}/>}
                                    <Button type={strokeType === EStrokeType.Normal ? 'primary' : 'default'} icon={<NormPencilIcon />} onClick={()=>{
                                        window.room.setMemberState({strokeType:EStrokeType.Normal});
                                        setStrokeType(EStrokeType.Normal)
                                    }}/>
                                    <Button type={strokeType === EStrokeType.Dotted ? 'primary' : 'default'} icon={<DottedPencilIcon />} onClick={()=>{
                                        window.room.setMemberState({strokeType:EStrokeType.Dotted});
                                        setStrokeType(EStrokeType.Dotted)
                                    }}/>
                                    <Button type={strokeType === EStrokeType.LongDotted ? 'primary' : 'default'} icon={<DottedPencilLongIcon />} onClick={()=>{
                                        window.room.setMemberState({strokeType:EStrokeType.LongDotted});
                                        setStrokeType(EStrokeType.LongDotted)
                                    }}/>
                                </Space.Compact>
                                <Slider
                                    defaultValue = {defaultWidth}
                                    min={1}
                                    max={10}
                                    onAfterChange={setWidth}
                                />
                            </>
                        )
                    }}
                >
                    <Button icon={ strokeType === EStrokeType.Stroke ? <StrokePencilIcon /> : 
                        strokeType === EStrokeType.Normal ? <NormPencilIcon /> : 
                        strokeType === EStrokeType.LongDotted ? <DottedPencilLongIcon /> : 
                        <DottedPencilIcon />}/>
                </Popover>
            )
        }
        return null;
    }, [toolsKey, strokeType])

    return (
        <div className={styles['PencilTools']}>
            {_colorPicker}
            {_strokeType}
        </div>
    )
}