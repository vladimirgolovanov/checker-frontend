import React from "react";
import {Badge} from "react-bootstrap";

interface NameBadgeProps {
    name: string;
    result: number;
}

const NameBadge: React.FC<NameBadgeProps> = ({name, result}) => {
    let backgroundColor: string = 'failed';

    /* todo: free 1, used 2, pending 3, failed 4 */
    switch (result) {
        case 1: // free
            backgroundColor = 'success';
            break;
        case 2: // used
            backgroundColor = 'danger';
            break;
        case 3: // pending
            backgroundColor = 'secondary';
            break;
        case 4: // failed
            backgroundColor = 'dark';
            break;
    }
    return (
        <Badge bg={backgroundColor}>{name}</Badge>
    )
}

export default NameBadge;
