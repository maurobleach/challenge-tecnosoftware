import { Dialog, DialogActions, DialogTitle, DialogContent } from "@mui/material";
export interface IModalProps {
    title: string;
    content: React.ReactNode;
    actions: React.ReactNode;
    open: boolean;
    onClose: () => void;
    fullWidth?: boolean;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}
export function Modal({ title, content, actions, open, onClose, fullWidth, maxWidth }: IModalProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth={fullWidth} maxWidth={maxWidth}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                {actions}
            </DialogActions>
        </Dialog>
    )
}