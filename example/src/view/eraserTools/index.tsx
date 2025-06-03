 
import {useContext, useState} from 'react';
import { ErasersIcon, PencilEraserIcon } from '../assets/svg';
import { Popover, Button, FloatButton, Flex, Switch } from 'antd';
import { AppContext } from "../App";
import { EToolsKey } from '@netless/appliance-plugin';
import React from 'react';

const EraserToolsKeys = [EToolsKey.Eraser, EToolsKey.PencilEraser, EToolsKey.BitMapEraser]

const EraserIcons = (props:{toolsKey: EToolsKey, color: string}) => {
    const {color, toolsKey} = props;
    switch (toolsKey) {
        case EToolsKey.Eraser:
            return <ErasersIcon style={{color}}/>
        case EToolsKey.BitMapEraser:
        case EToolsKey.PencilEraser:
            return <PencilEraserIcon style={{color}} />
        default:
            return <ErasersIcon style={{color}}/>
    }
}

const EraserTools = () => {
    const {toolsKey, setToolsKey} = useContext(AppContext);
    const onChange = (checked: boolean) => {
        if (checked) {
            window.appliancePlugin.currentManager.setPriority("cpu")
        } else {
            window.appliancePlugin.currentManager.setPriority("ui")
        }
    }
    return <div >
            <Flex>
                <Button
                    type="text"
                    icon={ <EraserIcons toolsKey={EToolsKey.Eraser} color={toolsKey === EToolsKey.Eraser ? '#1677ff' : 'black'} />}
                    onClick={() => setToolsKey(EToolsKey.Eraser)}
                />
                <Button
                    type="text"
                    icon={ <EraserIcons toolsKey={EToolsKey.PencilEraser} color={toolsKey === EToolsKey.PencilEraser ? '#1677ff' : 'black'} />}
                    onClick={() => setToolsKey(EToolsKey.PencilEraser)}
                />
                <Switch defaultChecked onChange={onChange} />
            </Flex>
        </div>
}

export const EraserButtons = () => {
    const {toolsKey, setToolsKey} = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={<EraserTools/>}
            placement="right"
            open={open}
            onOpenChange={handleOpenChange}
        >
            <FloatButton 
                type={EraserToolsKeys.includes(toolsKey)? 'primary' : 'default'} 
                icon={<EraserIcons toolsKey={toolsKey} color={ EraserToolsKeys.includes(toolsKey) ? 'white' : 'black' } />}
                onClick={() => {
                    if (!EraserToolsKeys.includes(toolsKey)) {
                        setToolsKey(EToolsKey.Eraser); 
                    }
                }}
            />
        </Popover>
    )
}