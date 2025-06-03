/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import {useContext, useState} from 'react';
import { ArrowIcon, EllipseIcon, RectangleIcon, RhombusIcon, SpeechBalloonIcon, StarIcon, StraightIcon, TriangleIcon } from '../assets/svg';
import { Popover, Button, FloatButton, Slider, Flex, Form, InputNumber, Select } from 'antd';
import { AppContext } from "../App";
import { EToolsKey, ShapeType } from '@netless/appliance-plugin';
import { ApplianceNames } from 'white-web-sdk';
import React from 'react';

const GeometryToolsKeys = [EToolsKey.Straight, EToolsKey.Arrow, EToolsKey.Ellipse, EToolsKey.Rectangle, EToolsKey.Star, EToolsKey.Triangle, EToolsKey.SpeechBalloon]

const GeometryIcons = (props:{toolsKey: EToolsKey, color: string}) => {
    const {color, toolsKey} = props;
    switch (toolsKey) {
        case EToolsKey.Straight:
            return <StraightIcon style={{color}} />
        case EToolsKey.Arrow:
            return <ArrowIcon style={{color}} />
        case EToolsKey.Ellipse:
            return <EllipseIcon style={{color}} />
        case EToolsKey.Rectangle:
            return <RectangleIcon style={{color}} /> 
        case EToolsKey.Star:
            return <StarIcon style={{color}} />    
        case EToolsKey.Triangle:
            return <TriangleIcon style={{color}} />
        case EToolsKey.Rhombus:
            return <RhombusIcon style={{color}} />
        case EToolsKey.SpeechBalloon:
            return <SpeechBalloonIcon style={{color}} /> 
        default:
            return <RectangleIcon style={{color}} />
    }
}

const GeometryTools = () => {
    const {toolsKey, setToolsKey} = useContext(AppContext);
    const defaultWidth:number = window.room.state.memberState.strokeWidth;
    const defaultOpacity:number = window.room.state.memberState.strokeOpacity || 1;
    const setWidth = (value: number)=>{
        window.room.setMemberState({strokeWidth: value});
    }
    const setOpacity = (value: number)=>{
        window.room.setMemberState({strokeOpacity: value, fillOpacity: value});
    }
    const onFinishPolygon = (values: any) => {
        window.room.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType: ShapeType.Polygon, ...values});
    };
    const onFinishStar = (values: any) => {
        window.room.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType: ShapeType.Star, ...values});
    };
    const onFinishSpeechBalloon = (values: any) =>{
        window.room.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType: ShapeType.SpeechBalloon, ...values});
    }
    return <div className={styles['GeometryTools']}>
                <Flex>
                    <Flex vertical>
                        <Flex>
                            <Button
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Arrow} color={toolsKey === EToolsKey.Arrow ? '#1677ff' : 'black'} />}
                                onClick={() => setToolsKey(EToolsKey.Arrow)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Straight} color={toolsKey === EToolsKey.Straight? '#1677ff' : 'black' } />}
                                onClick={() => setToolsKey(EToolsKey.Straight)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Ellipse} color={toolsKey === EToolsKey.Ellipse? '#1677ff' : 'black' } />}
                                onClick={() => setToolsKey(EToolsKey.Ellipse)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Rectangle} color={toolsKey === EToolsKey.Rectangle? '#1677ff' : 'black' } />}
                                onClick={() => setToolsKey(EToolsKey.Rectangle)}
                            />
                        </Flex>
                        <Flex>
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Star} color={toolsKey === EToolsKey.Star ? '#1677ff' : 'black'} />}
                                onClick={() => setToolsKey(EToolsKey.Star)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Triangle} color={toolsKey === EToolsKey.Triangle ? '#1677ff' : 'black'} />}
                                onClick={() => setToolsKey(EToolsKey.Triangle)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.Rhombus} color={toolsKey === EToolsKey.Rhombus ? '#1677ff' : 'black'} />}
                                onClick={() => setToolsKey(EToolsKey.Rhombus)}
                            />
                            <Button 
                                type="text"
                                icon={ <GeometryIcons toolsKey={EToolsKey.SpeechBalloon} color={toolsKey === EToolsKey.SpeechBalloon ? '#1677ff' : 'black'} />}
                                onClick={() => setToolsKey(EToolsKey.SpeechBalloon)}
                            />
                        </Flex>
                        <Flex>
                            <div>strokeWidth: </div>
                            <Slider
                                style={{width:'100%'}}
                                defaultValue = {defaultWidth}
                                min={1}
                                max={10}
                                onAfterChange={setWidth}
                            />
                        </Flex>
                        <Flex>
                            <div>opacity: </div>
                            <Slider
                                style={{width:'100%'}}
                                defaultValue = {defaultOpacity}
                                min={0}
                                max={1}
                                step={0.1}
                                onAfterChange={setOpacity}
                            />
                        </Flex>
                        <Flex>
                            <Form size='small' layout="vertical" style={{width:'100%', background:'rgba(0,0,0,0.05)', fontSize:'12px'}} onFinish={onFinishPolygon}>
                                <Form.Item label="顶点数" name="vertices" rules={[{ required: true}]} style={{marginBottom:4, fontSize:'12px'}}>
                                    <InputNumber size='small' placeholder="input vertices" />
                                </Form.Item>
                                <Form.Item style={{marginBottom:4, fontSize:'12px'}}>
                                    <Button size='small' type="primary" htmlType="submit">
                                        自定义多边形
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Flex>
                    </Flex>
                    <Flex vertical style={{marginLeft:'10px'}}>
                        <Form size='small' layout="vertical" style={{width:'100%', background:'rgba(0,0,0,0.05)', fontSize:'12px'}} onFinish={onFinishStar}>
                            <Form.Item label="顶点数" rules={[{ required: true}]} name="vertices" style={{marginBottom:4, fontSize:'12px'}}>
                                <InputNumber size='small' placeholder="input vertices" />
                            </Form.Item>
                            <Form.Item label="向内顶点步长" rules={[{ required: true}]} name="innerVerticeStep" style={{marginBottom:4, fontSize:'12px'}}>
                                <InputNumber size='small' placeholder="input innerVerticeStep"/>
                            </Form.Item>
                            <Form.Item label="多边形向内顶点半径比率" name="innerRatio" rules={[{ required: true}]} style={{marginBottom:4, fontSize:'12px'}}>
                                <Slider
                                    marks={{
                                        0.2: '20',
                                        0.4: '40',
                                        0.6: '60',
                                        0.8: '80',
                                        1: '100',
                                    }}
                                    min={0.2}
                                    max={1}
                                    step={0.2}
                                />
                            </Form.Item>
                            <Form.Item style={{marginBottom:4, fontSize:'12px'}}>
                                <Button size='small' type="primary" htmlType="submit">
                                    自定义星形
                                </Button>
                            </Form.Item>
                        </Form>
                    </Flex>
                    <Flex vertical style={{marginLeft:'10px'}}>
                        <Form size='small' layout="vertical" style={{width:'100%', background:'rgba(0,0,0,0.05)', fontSize:'12px'}} onFinish={onFinishSpeechBalloon}>
                            <Form.Item label="箭头方向" rules={[{ required: true}]} name="placement" style={{marginBottom:4, fontSize:'12px'}}>
                                <Select size='small' placeholder="input placement">
                                    <Select.Option value="left">left</Select.Option>
                                    <Select.Option value="leftTop">leftTop</Select.Option>
                                    <Select.Option value="leftBottom">leftBottom</Select.Option>
                                    <Select.Option value="right">right</Select.Option>
                                    <Select.Option value="rightTop">rightTop</Select.Option>
                                    <Select.Option value="rightBottom">rightBottom</Select.Option>
                                    <Select.Option value="top">top</Select.Option>
                                    <Select.Option value="topLeft">topLeft</Select.Option>
                                    <Select.Option value="topRight">topRight</Select.Option>
                                    <Select.Option value="bottom">bottom</Select.Option>
                                    <Select.Option value="bottomLeft">bottomLeft</Select.Option>
                                    <Select.Option value="bottomRight">bottomRight</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item style={{marginBottom:4, fontSize:'12px'}}>
                                <Button size='small' type="primary" htmlType="submit">
                                    自定义气泡框
                                </Button>
                            </Form.Item>
                        </Form>
                    </Flex> 
                </Flex>
    </div>
}

export const GeometryButtons = () => {
    const {toolsKey, setToolsKey} = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={<GeometryTools/>}
            placement="right"
            open={open}
            onOpenChange={handleOpenChange}
        >
            <FloatButton 
                type={GeometryToolsKeys.includes(toolsKey) ? 'primary' : 'default'} 
                icon={<GeometryIcons toolsKey={toolsKey} color={GeometryToolsKeys.includes(toolsKey) ? 'white' : 'black'} />}
                onClick={() => {
                    if (!GeometryToolsKeys.includes(toolsKey)) {
                        setToolsKey(EToolsKey.Rectangle);
                    }
                }}
            />
        </Popover>
    )
}