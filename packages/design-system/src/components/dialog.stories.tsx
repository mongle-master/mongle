import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Button } from "./button";
import { Dialog, DialogDescription, DialogFooter, DialogTitle } from "./dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          기록 삭제
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>이 기록을 삭제할까요?</DialogTitle>
          <DialogDescription>삭제된 기록은 되돌릴 수 없습니다.</DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              삭제
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};
