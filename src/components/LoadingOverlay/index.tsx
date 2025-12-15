import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { UNSAFE_DO_NOT_USE_isLoadingAtom } from "@/utils/store";
import LoadingIcon from "../Base/LoadingIcon";
import {  Dialog } from "@/components/Base/Headless";
import { useState } from "react";


export default function Main() {
  const isMutating = useIsMutating({
    predicate(mutation) {
      return !!mutation.options.meta?.showLoader;
    },
  });

  const isQuerying = useIsFetching({
    fetchStatus: "fetching",
    predicate(query) {
      return !!query.options.meta?.showLoader
      ;
    },
  });
  const isLoading = useAtomValue(UNSAFE_DO_NOT_USE_isLoadingAtom);

  if (isLoading || isQuerying || isMutating) {
  return (

      <Dialog
        open
        onClose={() => null}
        onBlurCapture={() => null}
      >
        <Dialog.Panel className="p-10 text-center">
          <div className="w-full h-8 mb-8 text-center justify-center">
            <LoadingIcon icon="ball-triangle" className="w-6 h-8" />
          </div>
          <div className="text-center text-greyscale-5 text-heading-4">
            Loading...
          </div>
        </Dialog.Panel>
      </Dialog>
    );
  }

  return null;
}
