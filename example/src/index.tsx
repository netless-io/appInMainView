/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Select } from "antd";
import { useState } from "react";
import { Region, regions } from "./region";
import { createRoom } from "./api";
import React from "react";
const IndexPage = ()=>{
    const [region,setRegion] = useState<Region>('cn-hz');
    const [loading,setLoading] = useState<boolean>(false);
    const [loading1,setLoading1] = useState<boolean>(false);
    // const navigate = useNavigate();
    const handleChange = (value: Region) => {
        setRegion(value);
    };
    async function go(hash:string){
        const room = await createRoom(region);
        const {roomToken,roomUUID} = room
        sessionStorage.setItem('uid','uid-1234')
        window.location.href= `${document.location.origin}${document.location.pathname}#${hash}?roomToken=${roomToken}&uuid=${roomUUID}`;
    }
    // useEffect(()=>{
    //     if (window.manager) {
    //         if(!window.manager){
    //             (window.room as Room).bindHtmlElement(null);
    //             window.appliancePlugin?.destroy();
    //         }
    //         if (window.manager) {
    //             (window.manager as WindowManager).destroy();
    //             window.manager = undefined;
    //             (window.appliancePlugin as any)?.destroy();
    //             window.appliancePlugin = undefined;
    //         }
    //         if (window.room && !window.room.didConnected) {
    //             (window.room as Room).disconnect().then(()=>{
    //                 window.room = undefined;
    //             }) 
    //         }      
    //     }
    // },[])
    return <Flex justify="center" align="center" vertical style={{position:'absolute',width:'100vw', height:'100vh'}}>
        <Flex style={{width:200}} vertical justify="center" align="center" gap='small'>
                <Select
                defaultValue="cn-hz"
                style={{ width: 120 }}
                onChange={handleChange}
                options={regions.map(v=>({value:v.region,label:v.emoji + v.name}))}
                />
                <Button type="primary" block onClick={()=>{
                    if (!loading) {
                        setLoading(true);
                        go('/window-manager');
                    }
                }} loading ={loading}>
                    window-manager
                </Button>
                <Button type="primary" block onClick={()=>{
                    if (!loading1) {
                        setLoading1(true);
                        go('/fastboard');
                    }
                }} loading ={loading1}>
                    fastboard
                </Button>

        </Flex>
    </Flex>
}
export default IndexPage;