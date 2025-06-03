 
import {useState, useContext, useEffect} from 'react';
import { Popover, FloatButton, Avatar, Badge} from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { AppContext } from '../App';
import { AppliancePluginInstance } from '@netless/appliance-plugin';

// eslint-disable-next-line react-refresh/only-export-components
export function rgbToHex (r: number, g: number, b: number) {
    const hex = ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");
    return "#" + hex;
}
const RenderTools = () => {
    const [renderUid, setRenderUid] = useState<string | true>(true);
    const {roomMembers} = useContext(AppContext);
    useEffect(()=>{
        (window.appliancePlugin as AppliancePluginInstance).addListener('syncRenderUids', listenerCallbacks);
        return ()=>{
            (window.appliancePlugin as AppliancePluginInstance).removeListener('syncRenderUids', listenerCallbacks);
        }
    },[])
    const listenerCallbacks = (_viewId:string, syncData:{render?:Set<string>|true, hide?:Set<string>|true, clear?:Set<string>|true}) => {
        const {render} = syncData;
        let _renderUids:string | true = true;
        if (render === true) {
          _renderUids = true;
        } else if (render && renderUid === true) {
            _renderUids = [...render][0];
        } 
        setRenderUid(_renderUids);
    }

    useEffect(()=>{
        if(renderUid === true){
            window.appliancePlugin.filterRenderByUid('mainView', { render: renderUid });
        } else {
            window.appliancePlugin.filterRenderByUid('mainView', { render: [renderUid] });
        }
    },[renderUid])
    return <div>
            <Avatar.Group>
                <Badge dot={renderUid === true}>
                    <Avatar 
                        shape="square"
                        onClick={()=>{
                            setRenderUid(true);
                        }}
                        style={{ verticalAlign: 'middle'}}
                        size="large" 
                        gap={4}
                    >
                        {'all'}
                    </Avatar>
                </Badge>
                {
                    !!roomMembers?.length && roomMembers?.map((r,i)=>{
                        const color = r.memberState.strokeColor;
                        const uid = r.payload?.uid;
                        if (!uid) {
                            return null;
                        }
                        return (
                            <Badge key={i} dot={renderUid === uid}>
                                <Avatar 
                                    shape="square"
                                    onClick={(e)=>{
                                        setRenderUid(uid);
                                        e?.stopPropagation();
                                        return false;
                                    }}
                                    style={{ backgroundColor: rgbToHex(color[0],color[1],color[2]), verticalAlign: 'middle'}}
                                    size="large" 
                                    gap={1}
                                >
                                    {uid}
                                </Avatar>
                            </Badge>
                        )
                    })
                }
            </Avatar.Group>
        </div>
}

export const RenderButtons = () => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={<RenderTools/>}
            placement="right"
            open={open}
            trigger="click"
            onOpenChange={handleOpenChange}
        >
            <FloatButton 
                type={'default'} 
                icon={<UserOutlined />}
            />
        </Popover>
    )
}