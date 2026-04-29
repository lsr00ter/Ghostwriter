import * as React from "react";

import { t } from "../i18n";

export default class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // React will print the error, no special handling needed
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t(
                        "error.collabEditor",
                        "The collaborative editor has experienced an error."
                    )}
                    <br />
                    {t(
                        "error.browserConsole",
                        "Please check the Browser Console (F12) for more details."
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}
