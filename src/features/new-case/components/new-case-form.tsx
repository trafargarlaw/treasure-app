"use client";

import { FormCombobox } from "@/components/form-combobox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NewClientForm } from "@/features/new-client";
import { NewCourtForm } from "@/features/new-court";
import { NewJudgeForm } from "@/features/new-judge";
import {
  getGetClientListQueryOptions,
  getGetCourtListQueryOptions,
  getGetJudgeListQueryOptions,
  useCreateCase,
  useGetCaseTypeList,
  useGetClientList,
  useGetCourtList,
  useGetJudgeList,
} from "@/gen/endpoints/fastAPI";
import { createCaseBody } from "@/gen/endpoints/fastAPI.zod";
import { GetCourtDetail, GetLegalClientDetail, Judge } from "@/gen/models";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function NewCaseForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isClientSheetOpen, setIsClientSheetOpen] = useState(false);
  const [isCourtSheetOpen, setIsCourtSheetOpen] = useState(false);
  const [isJudgeSheetOpen, setIsJudgeSheetOpen] = useState(false);
  const form = useForm<z.infer<typeof createCaseBody>>({
    resolver: zodResolver(createCaseBody),
  });

  const { data: clientsData } = useGetClientList();
  const { data: caseTypeData } = useGetCaseTypeList();
  const { data: courtsData } = useGetCourtList();
  const { data: judgesData } = useGetJudgeList();

  const { mutateAsync: createCaseAsync } = useCreateCase();

  const onSubmit = async (data: z.infer<typeof createCaseBody>) => {
    try {
      await createCaseAsync({
        data: {
          case_type_id: Number(data.case_type_id),
          legal_client_id: Number(data.legal_client_id),
          presiding_judge_id: Number(data.presiding_judge_id),
          court_id: Number(data.court_id),
          created_at: data.created_at,
        },
      });
      router.navigate({ to: "/cases" });

      toast.success("Case created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create case");
    }
  };

  async function onClientSuccess(data: GetLegalClientDetail) {
    await queryClient.invalidateQueries(getGetClientListQueryOptions());
    setIsClientSheetOpen(false);
    form.setValue("legal_client_id", data.id);
  }

  async function onCourtSuccess(data: GetCourtDetail) {
    await queryClient.invalidateQueries(getGetCourtListQueryOptions());
    setIsCourtSheetOpen(false);
    form.setValue("court_id", data.id);
  }

  async function onJudgeSuccess(data: Judge) {
    await queryClient.invalidateQueries(getGetJudgeListQueryOptions());
    setIsJudgeSheetOpen(false);
    form.setValue("presiding_judge_id", data.id);
  }

  return (
    <>
      <Sheet
        open={isClientSheetOpen || isCourtSheetOpen || isJudgeSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsClientSheetOpen(false);
            setIsCourtSheetOpen(false);
            setIsJudgeSheetOpen(false);
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {isClientSheetOpen ? "Create a new client" : "Create a new court"}
            </SheetTitle>
            <SheetDescription>
              {/* Create a new client to add to this case */}
            </SheetDescription>
          </SheetHeader>

          {isClientSheetOpen && <NewClientForm onSuccess={onClientSuccess} />}
          {isCourtSheetOpen && <NewCourtForm onSuccess={onCourtSuccess} />}
          {isJudgeSheetOpen && <NewJudgeForm onSuccess={onJudgeSuccess} />}
        </SheetContent>
      </Sheet>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {clientsData?.data && (
            <FormCombobox
              control={form.control}
              name="legal_client_id"
              options={clientsData?.data?.map((client) => ({
                id: client.id,
                label: `${client.first_name_lat} ${client.last_name_lat}`,
              }))}
              label="Client"
              placeholder="Select client"
              searchPlaceholder="Search clients..."
              // emptyMessage="No clients found"
              onNewItem={() => setIsClientSheetOpen(true)}
            />
          )}

          {/* TODO: Add case type new item when api is ready */}
          {caseTypeData?.data && (
            <FormCombobox
              control={form.control}
              name="case_type_id"
              options={caseTypeData?.data?.map((caseType) => ({
                id: caseType.id,
                label: caseType.type_name,
              }))}
              label="Case Type"
              placeholder="Select case type"
              searchPlaceholder="Search case types..."
              emptyMessage="No case types found"
            />
          )}

          {/* TODO: Add case number when api is ready
          <FormField
            control={form.control}
            name="case_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          */}

          <FormField
            control={form.control}
            name="created_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Created at</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={(date) => {
                        const localDate = date
                          ? new Date(date.setHours(12))
                          : new Date();
                        field.onChange(localDate.toISOString());
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          {courtsData?.data && (
            <FormCombobox
              control={form.control}
              name="court_id"
              options={courtsData?.data?.map((court) => ({
                id: court.id,
                label: `${court.type?.court_type_fr} - ${court.city?.city_name_fr}`,
              }))}
              label="Court"
              placeholder="Select court"
              searchPlaceholder="Search courts..."
              onNewItem={() => setIsCourtSheetOpen(true)}
            />
          )}

          {/* TODO: Add presiding judge new item when api is ready */}
          {judgesData?.data && (
            <FormCombobox
              control={form.control}
              name="presiding_judge_id"
              options={judgesData?.data?.map((judge) => ({
                id: judge.id,
                label: judge.full_name,
              }))}
              label="Presiding Judge"
              placeholder="Select presiding judge"
              searchPlaceholder="Search presiding judges..."
              onNewItem={() => setIsJudgeSheetOpen(true)}
            />
          )}

          <Button type="submit">Create Case</Button>
        </form>
      </Form>
    </>
  );
}
