import React from "react";
import {Badge} from "react-bootstrap";

interface NameBadgeProps {
    name: string;
    result: number;
}

const NameBadge: React.FC<NameBadgeProps> = ({name, result}) => {
    let backgroundColor: string = 'failed';

    let title = 'Failed';

    switch (result) {
        case 1:
            backgroundColor = 'success';
            title = 'Free';
            break;
        case 2:
            backgroundColor = 'danger';
            title = 'Used';
            break;
        case 3:
            backgroundColor = 'secondary';
            title = 'Pending';
            break;
        case 4:
            backgroundColor = 'dark';
            title = 'Failed';
            break;
    }
    return (
        <Badge bg={backgroundColor} title={title}>{name}</Badge>
    )
}

export default NameBadge;
