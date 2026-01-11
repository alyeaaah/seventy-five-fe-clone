import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogPostsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  AutoComplete,
  Divider
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import UploadDropzone from "@/components/UploadDropzone";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { BlogPostPayload, blogPostPayloadSchema } from "../api/schema";
import { TagsApiHooks } from "../../MasterData/Tags/api";
import { useDebounce } from "ahooks";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { isHtmlEmpty } from "@/utils/helper";

export const BlogPostsNew = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.blog.edit);
  const { id: blogPostUuid } = queryParams;
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [tagKeyword, setTagKeyword] = useState<string>("");

  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { mutate: actionCreateBlogPost } = BlogPostsApiHooks.useCreateBlogPosts({}, {
    retry: false
  });
  const location = useLocation();
  const { data } = BlogPostsApiHooks.useGetBlogPostsDetail({
    params: {
      uuid: blogPostUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid,
          title: data.data.title,
          content: decodeURIComponent(data.data.content),
          image_cover: data.data.image_cover,
          category_uuid: data.data.category_uuid || undefined,
          tags: data.data.tags || []
        });
      }
    },
    enabled: !!blogPostUuid
  });
  const { data: tagData } = TagsApiHooks.useGetTagsList(
    {
      queries: {
        search: useDebounce( tagKeyword, {wait:400}),
        limit:30
      }
    }
  );
  const { mutate: actionUpdateBlogPost } = BlogPostsApiHooks.useUpdateBlogPosts(
    {
      params: {
        uuid: blogPostUuid || 0
      }
    }, {
      retry: false
    }
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: blogPostUuid || "",
      title: data?.data?.title || "",
      content: data?.data?.content ? decodeURIComponent(data.data.content) : "",
      image_cover: data?.data?.image_cover || "",
      category_uuid: data?.data?.category_uuid || "",
      tags: data?.data?.tags || []
    },
    resolver: zodResolver(blogPostPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const { mutateAsync: actionUploadImage } = adminApiHooks.useMediaUpload({});

  const uploadHandler = async (info: UploadChangeParam, index: number) => {
    setUploading(true);
    await actionUploadImage({ image: info.file as RcFile }, {
      onError: (error) => {
        setUploading(false);
        showNotification({
          duration: 3000,
          text: `Failed to upload image ${error?.message}`,
          icon: "XCircle",
          variant: "danger",
        });
      },
      onSuccess: (res) => {
        setValue(`image_cover`, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
  }
  const onSubmit: SubmitHandler<any> = (values: BlogPostPayload) => {
    values.content = encodeURIComponent(
      values.content
        .replace(/class="ql-size-small"/g, 'class="text-xs"')
        .replace(/class="ql-size-large"/g, 'class="text-xl"')
        .replace(/class="ql-size-huge"/g, 'class="text-3xl"')
        // For other classes you might want to replace
        .replace(/class="ql-align-center"/g, 'class="text-center"')
        .replace(/class="ql-align-right"/g, 'class="text-right"')
    );
    if (blogPostUuid) {
      const existingTags = data?.data?.tags || [];
      const removedTags = existingTags.filter(tag => !values?.tags?.find(f => f.tag_uuid === tag.tag_uuid)).map(tag => ({
        ...tag,
        is_delete: true,
        name: tag.name || "",
        tag_uuid: tag.tag_uuid || "",
        uuid: tag.uuid || ""
      }));
      values.tags = [...(values?.tags || []), ...(removedTags || [])];
      
      actionUpdateBlogPost(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPosts"),
          });
          queryClient.invalidateQueries({
            queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPostsDetail"),
          });
          showNotification({
            duration: 3000,
            text: "BlogPost updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update blogPost",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateBlogPost(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPosts"),
          });
          queryClient.invalidateQueries({
            queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPostsDetail"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "BlogPost created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create blogPost",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{blogPostUuid ? "Edit" : "Create New"} Blog Post</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname+"_form"}>
        <form onSubmit={handleSubmit(onSubmit)} key={location.pathname+"_form2"}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 grid grid-cols-12 gap-4 intro-y box p-4">

              <div className="col-span-12 sm:col-span-12 w-full relative">
                <Controller
                  name={`image_cover`}
                  control={control}
                  defaultValue=""
                  key={location.pathname + `image_cover`}
                  render={({ field, fieldState }) =>
                    <>
                      <UploadDropzone
                        className="h-36"
                        uploadType="image"
                        name={`image_cover`}
                        index={0}
                        onChange={uploadHandler}
                        fileList={field.value ? [field.value] : []}
                        onRemove={() => {
                          setValue(`image_cover`, "", {
                            shouldValidate: true,
                          });
                        }}
                        loading={uploading}
                      />

                      {!!fieldState.error && (
                        <FormHelp className={"text-danger absolute bottom-2 left-2"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Title</FormLabel>
                <Controller
                  name="title"
                  key={location.pathname+"_title"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormInput
                        id="validation-form-6"
                        name="name"
                        value={field.value}
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="Title"
                      >
                      </FormInput>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Content</FormLabel>
                <Controller
                  name="content"
                  key={location.pathname+"_content"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <ReactQuill
                        value={field.value}
                        onChange={field.onChange}
                        theme="snow"
                        className="w-full min-h-36"
                      />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <div className="col-span-12 ">
                {
                  watch('tags').map(d =>
                  (
                    <div
                      key={d.tag_uuid}
                      className="inline-flex flex-row text-xs bg-[#065740] text-white rounded-lg mr-2 mb-2 hover:cursor-pointer hover:bg-[#0e3228]"
                      onClick={() => {
                        setValue('tags', watch('tags').filter(p => p.tag_uuid !== d.tag_uuid));
                      }}
                    >
                      <span className="flex flex-col py-1 px-2">#{d.name}</span>
                      <div className="bg-[#dcb540] hover:bg-[#c8d73d] text-[#065740] rounded-r-md items-center flex">
                        <Lucide icon="X" />
                      </div>
                    </div>
                  ))}
                <Controller
                  name="tags"
                  key="tags"
                  control={control}
                  render={({ fieldState }) =>
                    <>
                      <AutoComplete
                        className="shadow-sm w-full h-[38px] tag-autocomplete"
                        suffixIcon={<Lucide icon="Search" />}
                        prefix={"#"}
                        value={tagKeyword}
                        options={tagData?.data?.map(tag => {
                          const tagAdded = watch('tags').filter(p => tag.uuid === p.tag_uuid).length > 0;
                          return {
                            value: tag.uuid,
                            label: (
                              <div className={`flex flex-row justify-between ${tagAdded ? 'opacity-60' : ''}`}>
                                <div className="flex items-center flex-row">
                                  <span className="flex flex-col">
                                    <span className="mb-0">
                                      #{tag.name}
                                    </span>
                                  </span>
                                </div>
                                <div className=" hidden sm:flex items-center flex-row">
                                  {tagAdded ? (
                                    <div className="text-[10px] text-gray-500">Already Added</div>
                                  ) : (
                                    <Lucide icon="Plus" className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            ),
                            name: tag.name,
                          };
                        })}
                        onSelect={(value, option) => {
                          const tags = getValues('tags') || [];
                          const tagAdded = tags.filter(p => value === p.tag_uuid).length > 0;
                          if (tagAdded) return;
                          setValue('tags', [...tags, { tag_uuid: value, name: option.name }], {
                            shouldValidate: true,
                          });
                        }}
                        onSearch={(text) => {
                          setTagKeyword(text);
                        }}
                        onChange={() => {
                          setTagKeyword("");
                        }}
                        placeholder="Search for tag to add"
                      />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <div className="col-span-12 hidden sm:flex">
                <Divider />
              </div>
              <div className="col-span-12 hidden sm:flex justify-end">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    methods.reset();
                    navigate(-1);
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={formState.isSubmitting || !formState.isValid || isHtmlEmpty(getValues('content'))}
                >
                  <Lucide icon="Save" className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-12 col-span-12">
              <div className="col-span-12 box sm:hidden p-4 flex justify-between" >
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    methods.reset();
                    navigate(-1);
                  }}
                  className="w-[46%]"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-[46%]"
                  disabled={formState.isSubmitting || !formState.isValid}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}