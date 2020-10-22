import React from "react";
import { Card, CardContent, Box } from "@material-ui/core";
import { widths } from "../../rootStyles";

const SchemaPage: React.FC = () => {
    return (
        <Box margin="auto" maxWidth={widths.minPageWidth}>
            <Card>
                <CardContent>
                    <iframe
                        title="CIDC Schema"
                        src="https://cimac-cidc.github.io/cidc-schemas/docs/index.html"
                        width={widths.minPageWidth - 20}
                        height={1000}
                        frameBorder="0"
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default SchemaPage;
