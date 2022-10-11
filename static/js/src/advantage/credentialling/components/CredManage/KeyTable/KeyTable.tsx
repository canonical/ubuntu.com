import { CheckboxInput } from "@canonical/react-components";
import React, { useState } from "react";

type ActivationKey = {
    contractItemID: string,
    expirationDate: Date,
    key: string,
    productID: string
}
type Props = {
    keyList: ActivationKey[],
    reload: boolean
}
const KeyTable = ({ keyList, reload }: Props) => {

    console.log(reload);
    const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);
    const handleCheckbox = (keyValue: string) => {
        console.log(keyValue, selectedKeyIds);
        if (selectedKeyIds.includes(keyValue)) {
            setSelectedKeyIds(selectedKeyIds => selectedKeyIds.filter(id => id != keyValue));
            console.log("r", selectedKeyIds);
        }
        else {
            setSelectedKeyIds(selectedKeyIds.concat(keyValue));
            console.log("a", selectedKeyIds);
        }
    };
    const copyToClipboard = (value: string) => {
        console.log(value);
        navigator.clipboard.writeText(value);
    };
    return (

        <tbody>
            {keyList.map((keyitem: ActivationKey) => {
                return (<tr>
                    <td><CheckboxInput onChange={() => { handleCheckbox(keyitem.key); }} label={undefined} /></td>
                    <td>{keyitem.key}</td>
                    <td><a onClick={() => { copyToClipboard(keyitem.key); }}><i className="p-icon--copy"></i></a></td>
                    <td></td>
                    <td>{keyitem.productID}</td>
                    <td>{keyitem.expirationDate.toString()}</td>
                </tr>);
            })}
        </tbody>
    );
}
export default KeyTable;