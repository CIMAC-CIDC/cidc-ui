import React from "react";
import { Button, Dialog, DialogContent } from "@material-ui/core";
import Clustergrammer from "../visualizations/Clustergrammer";
import { DataFile } from "../../model/file";

export interface IClustergrammerModalProps {
    file: DataFile;
}

const ClustergrammerModal: React.FC<IClustergrammerModalProps> = ({ file }) => {
    const [open, setOpen] = React.useState<boolean>(false);

    const width = 500;
    const height = 500;

    return (
        <>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
            >
                Visualize with Clustergrammer
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent style={{ width, height }}>
                    <Clustergrammer
                        networkData={file.clustergrammer}
                        width={width}
                        height={height}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClustergrammerModal;
