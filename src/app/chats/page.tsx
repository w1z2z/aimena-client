import { Suspense } from "react";

import { ChatsView } from "@/widgets/chats/ChatsView";

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="chats-page" />}>
      <ChatsView />
    </Suspense>
  );
}
