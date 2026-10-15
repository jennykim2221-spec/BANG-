import {useState} from 'react';
import {FivePlayerTable,fivePlayerInitial} from '../components/FivePlayerTable';
export function Distance(){const[value,setValue]=useState(fivePlayerInitial);return <><h1>누구에게 닿나요?</h1><FivePlayerTable value={value} onChange={setValue} configurable/></>}
