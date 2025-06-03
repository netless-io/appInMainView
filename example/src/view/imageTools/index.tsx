/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import React, {useState} from 'react';
import { Popover, Button, FloatButton, Flex, Form, InputNumber, Input, Switch } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

const ImageTools = () => {
    const onFinish = (values: any) =>{
        const uuid = Date.now().toString();
        const {src,...other} = values;
        // if (window.manager) {
        //     window.manager.insertImage({ uuid, ...other});
        //     window.manager.completeImageUpload(uuid, src);
        // } else {
            if(other.uniformScale === undefined){
                other.uniformScale = false;
            }
            window.room.insertImage({ uuid, ...other});
            window.room.completeImageUpload(uuid, src);
        // }
    }
    return <div className={styles['ImageTools']}>
                <Flex vertical>
                    <Form size='small' layout="horizontal" style={{width:'100%', background:'rgba(0,0,0,0.05)', fontSize:'12px'}} onFinish={onFinish}>
                        <Form.Item label="图片地址" initialValue={'https://p5.ssl.qhimg.com/t01a2bd87890397464a.png'} rules={[{ required: true}]} name="src" style={{marginBottom:0, fontSize:'12px'}}>
                            <Input size='small' placeholder="input src" />
                        </Form.Item>
                        <div style={{fontSize:'10px',marginBottom:4, color:'#999'}}>https://p5.ssl.qhimg.com/t01a2bd87890397464a.png</div>
                        <Form.Item label="显示位置:centerX" initialValue={0} rules={[{ required: true}]} name="centerX" style={{marginBottom:4, fontSize:'12px'}}>
                            <InputNumber size='small' placeholder="input centerX" />
                        </Form.Item>
                        <Form.Item label="显示位置:centerY" initialValue={0} rules={[{ required: true}]} name="centerY" style={{marginBottom:4, fontSize:'12px'}}>
                            <InputNumber size='small' placeholder="input centerY" />
                        </Form.Item>
                        <Form.Item label="图片宽度:width" initialValue={400} rules={[{ required: true}]} name="width" style={{marginBottom:4, fontSize:'12px'}}>
                            <InputNumber size='small' placeholder="input width" />
                        </Form.Item>
                        <Form.Item label="图片高度:height" initialValue={400} rules={[{ required: true}]} name="height" style={{marginBottom:4, fontSize:'12px'}}>
                            <InputNumber size='small' placeholder="input height" />
                        </Form.Item>
                        <Form.Item label="是否锁定" name="locked" valuePropName="checked" style={{marginBottom:4, fontSize:'12px'}}>
                            <Switch />
                        </Form.Item>
                        <Form.Item label="是否锁定宽高比缩放" name="uniformScale" valuePropName="checked"  style={{marginBottom:4, fontSize:'12px'}}>
                            <Switch/>
                        </Form.Item>
                        <Form.Item style={{marginBottom:4, fontSize:'12px'}}>
                            <Button size='small' type="primary" htmlType="submit">
                                插入图片
                            </Button>
                        </Form.Item>
                    </Form>
                </Flex>
    </div>
}

export const ImageButtons = () => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={<ImageTools/>}
            placement="right"
            open={open}
            onOpenChange={handleOpenChange}
        >
            <FloatButton 
                type={'default'} 
                icon={<FileImageOutlined />} 
            />
        </Popover>
    )
}