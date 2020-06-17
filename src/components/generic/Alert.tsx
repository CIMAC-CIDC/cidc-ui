import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@material-ui/core";

export interface IAlertProps {
    title: string;
    description?: string;
    open?: boolean;
    onAccept: () => void;
    onCancel?: () => void;
}

const Alert: React.FC<IAlertProps> = props => {
    return (
        <Dialog
            open={!!props.open}
            onClose={props.onCancel}
            style={{ zIndex: 9999 }}
        >
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                {props.description && (
                    <DialogContentText>{props.description}</DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                {props.onCancel && (
                    <Button onClick={props.onCancel} color="secondary">
                        Cancel
                    </Button>
                )}
                <Button onClick={props.onAccept} color="primary">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Alert;
