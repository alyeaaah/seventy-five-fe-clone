import { lazy, Suspense } from "react";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { CalendarOptions } from "@fullcalendar/core";

// Lazy load FullCalendar component untuk code splitting
const FullCalendarLazy = lazy(async () => {
  // Import CSS dan plugins secara dinamis
  await import("@/assets/css/vendors/full-calendar.css");
  const [
    { default: FullCalendar },
    { default: interactionPlugin },
    { default: dayGridPlugin },
    { default: timeGridPlugin },
    { default: listPlugin },
  ] = await Promise.all([
    import("@fullcalendar/react"),
    import("@fullcalendar/interaction"),
    import("@fullcalendar/daygrid"),
    import("@fullcalendar/timegrid"),
    import("@fullcalendar/list"),
  ]);

  return {
    default: (props: any) => (
      <FullCalendar
        {...props}
        plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
      />
    ),
  };
});

function Main() {
  const options: CalendarOptions = {
    droppable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    initialDate: "2021-01-12",
    navLinks: true,
    editable: true,
    dayMaxEvents: true,
    events: [
      {
        title: "Vue Vixens Day",
        start: "2021-01-05",
        end: "2021-01-08",
      },
      {
        title: "VueConfUS",
        start: "2021-01-11",
        end: "2021-01-15",
      },
      {
        title: "VueJS Amsterdam",
        start: "2021-01-17",
        end: "2021-01-21",
      },
      {
        title: "Vue Fes Japan 2019",
        start: "2021-01-21",
        end: "2021-01-24",
      },
      {
        title: "Laracon 2021",
        start: "2021-01-24",
        end: "2021-01-27",
      },
    ],
    drop: function (info) {
      if (
        document.querySelectorAll("#checkbox-events").length &&
        (document.querySelectorAll("#checkbox-events")[0] as HTMLInputElement)
          ?.checked
      ) {
        (info.draggedEl.parentNode as HTMLElement).remove();
        if (
          document.querySelectorAll("#calendar-events")[0].children.length == 1
        ) {
          document
            .querySelectorAll("#calendar-no-events")[0]
            .classList.remove("hidden");
        }
      }
    },
  };

  return (
    <div className="full-calendar">
      <Suspense fallback={<LoadingIcon icon="puff" />}>
        <FullCalendarLazy {...options} />
      </Suspense>
    </div>
  );
}

export default Main;
