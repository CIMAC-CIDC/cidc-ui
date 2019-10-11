import * as React from "react";
import autobind from "autobind-decorator";
import { getSingleFile } from "../../api/api";
import { DataFile } from "../../model/file";
import { Typography, CircularProgress, Grid, Button } from "@material-ui/core";
import FileDetailsTable from "./FileDetailsTable";
import { withIdToken } from "../identity/AuthProvider";
import AdditionalMetadataTable from "./AdditionalMetadataTable";

export interface IFileDetailsPageState {
    file: DataFile | undefined;
}

class FileDetailsPage extends React.Component<any, IFileDetailsPageState> {
    state: IFileDetailsPageState = {
        file: undefined
    };

    componentDidMount() {
        if (this.props.token) {
            this.getFile();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.token !== prevProps.token) {
            this.getFile();
        }
    }

    @autobind
    private getFile() {
        getSingleFile(this.props.token, this.props.match.params.fileId).then(
            result => {
                this.setState({ file: result });
            }
        );
    }

    public render() {
        return (
            <div className="Browse-files-page">
                {!this.state.file && (
                    <div className="Browse-files-progress">
                        <CircularProgress />
                    </div>
                )}
                {this.state.file && (
                    <Grid container spacing={3} direction="row">
                        <Grid item>
                            <Grid
                                container={true}
                                alignItems="flex-start"
                                justify="space-between"
                                direction="row"
                                spacing={2}
                            >
                                <Grid item={true} xs={7}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom={true}
                                    >
                                        Core File Properties
                                    </Typography>
                                </Grid>
                                <Grid item={true}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        href={this.state.file.download_link}
                                        style={{ height: 30 }}
                                    >
                                        Download
                                    </Button>
                                </Grid>
                            </Grid>
                            <FileDetailsTable file={this.state.file} />
                        </Grid>
                        {this.state.file.additional_metadata && (
                            <Grid item>
                                <Typography variant="h5" gutterBottom={true}>
                                    Additional Metadata
                                </Typography>
                                <AdditionalMetadataTable
                                    metadata={
                                        this.state.file.additional_metadata
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>
                )}
            </div>
        );
    }
}

export default withIdToken(FileDetailsPage);
