import type {ReactNode} from 'react';
import {LabelledText} from './LabelledText';
export function ImportantTip({children}:{children:ReactNode}) {
 return <p className="setup-important"><b aria-hidden="true">!</b><span>{typeof children==='string'?<LabelledText text={children}/>:children}</span></p>;
}
