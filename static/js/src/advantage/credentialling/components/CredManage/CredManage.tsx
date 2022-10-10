import { Button, CheckboxInput, ModularTable, Row } from "@canonical/react-components";
import React, { useMemo, useRef, useState } from "react";
import { listAllKeys } from "advantage/credentialling/api/keys";
import { useQuery } from "react-query";
const CredManage = () => {
    const [tab, changeTab] = useState(0);
    const inputRefs = useRef<HTMLButtonElement[] | null[]>([]);
    const {isLoading,data} = useQuery(["ActivationKeys"],
        async () => {
            return listAllKeys("cANU9TzI1bfZ2nnSSSnPdlp30TwdVkLse2vzi1TzKPBc");
        }
    );
    console.log(data);
    const switchTab = (
        event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number
    ) => {
        event.preventDefault();
        if (event.key == "ArrowLeft") {
            changeTab((currentIndex - 1) % 4);
            inputRefs.current[(currentIndex - 1) % 4].focus();
        }
        if (event.key == "ArrowRight") {
            changeTab((currentIndex + 1) % 4);
            inputRefs.current[(currentIndex + 1) % 4].focus();
        }
    };

    const copyToClipboard=(data)=>{
        console.log(data["value"]);
        navigator.clipboard.writeText(data["value"]);
    };

    const [selectedKeyIds,setSelectedKeyIds]=useState([]);
    const handleCheckbox = (keyValue)=>{
        console.log(keyValue,selectedKeyIds);
        if(selectedKeyIds.includes(keyValue)){
            setSelectedKeyIds(selectedKeyIds=>selectedKeyIds.filter(id=>id!=keyValue));
            console.log("r",selectedKeyIds);
        }
        else{
            setSelectedKeyIds(selectedKeyIds.concat(keyValue));
            console.log("a",selectedKeyIds);
        }
    };
    return (<div>
        <Row>
            <h1>Manage exam attempts</h1>
            <p>The table below shows exam attempts you have purchased</p>
            <p>To redeem an attempt, copy the associated key and paste it where the system asks you for the attempt key</p>
        </Row>
        <Row>
            <div className="p-segmented-control">
                <div
                    className="p-segmented-control__list"
                    role="tablist"
                    aria-label="Activatation Keys Table Filter"
                >
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 0}
                        aria-controls="all-keys-tab"
                        id="all-keys"
                        onClick={() => {
                            changeTab(0);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 4);
                        }}
                        ref={(ref) => (inputRefs.current[0] = ref)}
                    >
                        All Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 1}
                        aria-controls="unused-keys-tab"
                        id="unused-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(1);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 1);
                        }}
                        ref={(ref) => (inputRefs.current[1] = ref)}
                    >
                        Unused Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 2}
                        aria-controls="active-keys-tab"
                        id="active-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(2);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 2);
                        }}
                        ref={(ref) => (inputRefs.current[2] = ref)}
                    >
                        Active Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 3}
                        aria-controls="archived-keys-tab"
                        id="archived-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(3);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 3);
                        }}
                        ref={(ref) => (inputRefs.current[3] = ref)}
                    >
                        Archived Keys
                    </button>
                </div>
            </div>
        </Row>
        <Row>
            <ModularTable
                columns={useMemo(() => [
                    {
                        Header: "EXAM KEY ID",
                        accessor: "key",
                        width:300,
                        Cell: ({
                            value
                        }) => <span><CheckboxInput onChange={()=>{handleCheckbox(value);}} label={""}/>{value}<Button inline onClick={()=>{copyToClipboard({value});}}></Button></span>
                    },
                    {
                        Header: "ASSIGNEE",
                        accessor: "activatedBy",
                        Cell:({
                            value
                        }) => {
                            if(value)
                                return value;
                            else
                                return "N/A";
                        }
                    },
                    {
                        Header: "EXAM",
                        accessor: "productID"
                    },
                    {
                        Header: "EXPIRATION DATE",
                        accessor: "expirationDate"
                    }
                ], []
                )}
                data={isLoading?useMemo(()=>[{}],[data]):useMemo(() => data, [data])}
            />
        </Row>
    </div>);
};
export default CredManage;
