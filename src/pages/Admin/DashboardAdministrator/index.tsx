import _ from "lodash";
import clsx from "clsx";
import { useRef, useState } from "react";
import fakerData from "@/utils/faker";
import { FormInput } from "@/components/Base/Form";
import { TinySliderElement } from "@/components/Base/TinySlider";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import LeafletMap from "@/components/LeafletMap";
import { GeneralReportApiHooks } from "./api";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import moment from "moment";

function Main() {
  const [salesReportFilter, setSalesReportFilter] = useState<string>();
  const importantNotesRef = useRef<TinySliderElement>();
  const prevImportantNotes = () => {
    importantNotesRef.current?.tns.goTo("prev");
  };
  const nextImportantNotes = () => {
    importantNotesRef.current?.tns.goTo("next");
  };
  const { data, isLoading } = GeneralReportApiHooks.useGetGeneralReport();
  const { data: topPlayers } = GeneralReportApiHooks.useGetTopPlayers();
  const { data: upcomingTournaments } = GeneralReportApiHooks.useGetUpcomingTournaments();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 2xl:col-span-9">
        <div className="grid grid-cols-12 gap-6">
          {/* BEGIN: General Report */}
          <div className="col-span-12 mt-8">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                General Report
              </h2>
              <a href="" className="flex items-center ml-auto text-primary">
                <Lucide icon="RefreshCcw" className="w-4 h-4 mr-3" /> Reload
                Data
              </a>
            </div>
            <div className="grid grid-cols-12 gap-6 mt-5">
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="Swords"
                        className="w-[28px] h-[28px] text-primary"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Upcoming Match"
                        >
                          {Intl.NumberFormat().format(data?.data?.matches?.upcoming || 0)}
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {Intl.NumberFormat().format(data?.data?.matches?.total || 0)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Matches
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="Network"
                        className="w-[28px] h-[28px] text-pending"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-primary py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Upcoming Tournament"
                        >
                          {Intl.NumberFormat().format(data?.data?.tournaments?.upcoming || 0)}
                          <Lucide
                            icon="ChevronDown"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {Intl.NumberFormat().format(data?.data?.tournaments?.total || 0)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Tournaments
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="CircleUser"
                        className="w-[28px] h-[28px] text-warning"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Unverified Players"
                        >
                          {Intl.NumberFormat().format(data?.data?.players?.unverified || 0)}
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {Intl.NumberFormat().format(data?.data?.players?.total || 0)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Players
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="ShoppingCart"
                        className="w-[28px] h-[28px] text-warning"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Unverified Players"
                        >
                          {Intl.NumberFormat().format(data?.data?.orders?.total || 0)}
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      IDR {Intl.NumberFormat("id-ID").format(data?.data?.orders.monthly_gmv || 0)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      This Month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: General Report */}
          {/* BEGIN: Top Players */}
          <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-4 2xl:col-span-12 2xl:mt-8">
            <div className="flex items-center h-10 intro-x">
              <h2 className="mr-5 text-lg font-medium truncate">
                Top Players
              </h2>
            </div>
            <div className="mt-5">
              {topPlayers?.data?.map((player, idx) => (
                <div key={idx} className="intro-x">
                  <div className="flex items-center px-5 py-3 mb-3 box zoom-in">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-full image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={player.media_url || ""}
                      />
                    </div>
                    <div className="ml-4 mr-auto">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {player.age} Years Old
                      </div>
                    </div>
                    <div
                      className={"text-success"}
                    >
                      {player.point}
                    </div>
                  </div>
                </div>
              ))}
              <a
                href=""
                className=" w-full py-3 text-center border border-dotted rounded-md intro-x border-slate-400 dark:border-darkmode-300 text-slate-500 hidden"
              >
                View More
              </a>
            </div>
          </div>
          {/* END: Transactions */}
          {/* BEGIN: Sales Report */}
          {/* <div className="col-span-12 mt-8 lg:col-span-6">
            <div className="items-center block h-10 intro-y sm:flex">
              <h2 className="mr-5 text-lg font-medium truncate">
                Sales Report
              </h2>
              <div className="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3"
                />
                <Litepicker
                  value={salesReportFilter}
                  onChange={(e) => {
                    setSalesReportFilter(e.target.value);
                  }}
                  options={{
                    autoApply: false,
                    singleMode: false,
                    numberOfColumns: 2,
                    numberOfMonths: 2,
                    showWeekNumbers: true,
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-10 sm:w-56 !box"
                />
              </div>
            </div>
            <div className="p-5 mt-12 intro-y box sm:mt-5">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex">
                  <div>
                    <div className="text-lg font-medium text-primary dark:text-slate-300 xl:text-xl">
                      $15,000
                    </div>
                    <div className="mt-0.5 text-slate-500">This Month</div>
                  </div>
                  <div className="w-px h-12 mx-4 border border-r border-dashed border-slate-200 dark:border-darkmode-300 xl:mx-5"></div>
                  <div>
                    <div className="text-lg font-medium text-slate-500 xl:text-xl">
                      $10,000
                    </div>
                    <div className="mt-0.5 text-slate-500">Last Month</div>
                  </div>
                </div>
                <Menu className="mt-5 md:ml-auto md:mt-0">
                  <Menu.Button
                    as={Button}
                    variant="outline-secondary"
                    className="font-normal"
                  >
                    Filter by Category
                    <Lucide icon="ChevronDown" className="w-4 h-4 ml-2" />
                  </Menu.Button>
                  <Menu.Items className="w-40 h-32 overflow-y-auto">
                    <Menu.Item>PC & Laptop</Menu.Item>
                    <Menu.Item>Smartphone</Menu.Item>
                    <Menu.Item>Electronic</Menu.Item>
                    <Menu.Item>Photography</Menu.Item>
                    <Menu.Item>Sport</Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
              <div
                className={clsx([
                  "relative",
                  "before:content-[''] before:block before:absolute before:w-16 before:left-0 before:top-0 before:bottom-0 before:ml-10 before:mb-7 before:bg-gradient-to-r before:from-white before:via-white/80 before:to-transparent before:dark:from-darkmode-600",
                  "after:content-[''] after:block after:absolute after:w-16 after:right-0 after:top-0 after:bottom-0 after:mb-7 after:bg-gradient-to-l after:from-white after:via-white/80 after:to-transparent after:dark:from-darkmode-600",
                ])}
              >
                <ReportLineChart height={275} className="mt-6 -mb-6" />
              </div>
            </div>
          </div> */}
          {/* END: Sales Report */}
          {/* BEGIN: Weekly Top Seller */}
          {/* <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                Weekly Top Seller
              </h2>
              <a href="" className="ml-auto truncate text-primary">
                Show More
              </a>
            </div>
            <div className="p-5 mt-5 intro-y box">
              <div className="mt-3">
                <ReportPieChart height={213} />
              </div>
              <div className="mx-auto mt-8 w-52 sm:w-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">17 - 30 Years old</span>
                  <span className="ml-auto font-medium">62%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-pending"></div>
                  <span className="truncate">31 - 50 Years old</span>
                  <span className="ml-auto font-medium">33%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">&gt;= 50 Years old</span>
                  <span className="ml-auto font-medium">10%</span>
                </div>
              </div>
            </div>
          </div> */}
          {/* END: Weekly Top Seller */}
          {/* BEGIN: Sales Report */}
          {/* <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                Sales Report
              </h2>
              <a href="" className="ml-auto truncate text-primary">
                Show More
              </a>
            </div>
            <div className="p-5 mt-5 intro-y box">
              <div className="mt-3">
                <ReportDonutChart height={213} />
              </div>
              <div className="mx-auto mt-8 w-52 sm:w-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">17 - 30 Years old</span>
                  <span className="ml-auto font-medium">62%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-pending"></div>
                  <span className="truncate">31 - 50 Years old</span>
                  <span className="ml-auto font-medium">33%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">&gt;= 50 Years old</span>
                  <span className="ml-auto font-medium">10%</span>
                </div>
              </div>
            </div>
          </div> */}
          {/* END: Sales Report */}
          {/* BEGIN: Official Store */}
          <div className="col-span-12 mt-6 xl:col-span-8 hidden">
            <div className="items-center block h-10 intro-y sm:flex">
              <h2 className="mr-5 text-lg font-medium truncate">
                Official Store
              </h2>
              <div className="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide
                  icon="MapPin"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3"
                />
                <FormInput
                  type="text"
                  className="pl-10 sm:w-56 !box"
                  placeholder="Filter by city"
                />
              </div>
            </div>
            <div className="p-5 mt-12 intro-y box sm:mt-5">
              <div>
                250 Official stores in 21 countries, click the marker to see
                location details.
              </div>
              <LeafletMap className="h-[310px] mt-5 rounded-md bg-slate-200" />
            </div>
          </div>
          {/* END: Official Store */}
          {/* BEGIN: Weekly Best Sellers */}
          <div className="col-span-12 mt-6 xl:col-span-4 hidden">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                Weekly Best Sellers
              </h2>
            </div>
            <div className="mt-5">
              {_.take(fakerData, 4).map((faker, fakerKey) => (
                <div key={fakerKey} className="intro-y">
                  <div className="flex items-center px-4 py-4 mb-3 box zoom-in">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-md image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={faker.photos[0]}
                      />
                    </div>
                    <div className="ml-4 mr-auto">
                      <div className="font-medium">{faker.users[0].name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {faker.dates[0]}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium text-white rounded-full cursor-pointer bg-success">
                      137 Sales
                    </div>
                  </div>
                </div>
              ))}
              <a
                href=""
                className="block w-full py-4 text-center border border-dotted rounded-md intro-y border-slate-400 dark:border-darkmode-300 text-slate-500"
              >
                View More
              </a>
            </div>
          </div>
          {/* END: Weekly Best Sellers */}
          {/* BEGIN: General Report */}
          {/* <div className="grid grid-cols-12 col-span-12 gap-6 mt-8">
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex items-center">
                  <div className="flex-none w-2/4">
                    <div className="text-lg font-medium truncate">
                      Target Sales
                    </div>
                    <div className="mt-1 text-slate-500">300 Sales</div>
                  </div>
                  <div className="relative flex-none ml-auto">
                    <ReportDonutChart1 width={90} height={90} />
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full font-medium">
                      20%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex">
                  <div className="mr-3 text-lg font-medium truncate">
                    Social Media
                  </div>
                  <div className="flex items-center px-2 py-1 ml-auto text-xs truncate rounded-full cursor-pointer bg-slate-100 dark:bg-darkmode-400 text-slate-500">
                    320 Followers
                  </div>
                </div>
                <div className="mt-1">
                  <SimpleLineChart1 height={58} className="-ml-1" />
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex items-center">
                  <div className="flex-none w-2/4">
                    <div className="text-lg font-medium truncate">
                      New Products
                    </div>
                    <div className="mt-1 text-slate-500">1450 Products</div>
                  </div>
                  <div className="relative flex-none ml-auto">
                    <ReportDonutChart1 width={90} height={90} />
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full font-medium">
                      45%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex">
                  <div className="mr-3 text-lg font-medium truncate">
                    Posted Ads
                  </div>
                  <div className="flex items-center px-2 py-1 ml-auto text-xs truncate rounded-full cursor-pointer bg-slate-100 dark:bg-darkmode-400 text-slate-500">
                    180 Campaign
                  </div>
                </div>
                <div className="mt-1">
                  <SimpleLineChart1 height={58} className="-ml-1" />
                </div>
              </div>
            </div>
          </div> */}
          {/* END: General Report */}
          {/* BEGIN: Weekly Top Products */}
          {/* <div className="col-span-12 mt-6">
            <div className="items-center block h-10 intro-y sm:flex">
              <h2 className="mr-5 text-lg font-medium truncate">
                Weekly Top Products
              </h2>
              <div className="flex items-center mt-3 sm:ml-auto sm:mt-0">
                <Button className="flex items-center !box text-slate-600 dark:text-slate-300">
                  <Lucide
                    icon="FileText"
                    className="hidden w-4 h-4 mr-2 sm:block"
                  />
                  Export to Excel
                </Button>
                <Button className="flex items-center ml-3 !box text-slate-600 dark:text-slate-300">
                  <Lucide
                    icon="FileText"
                    className="hidden w-4 h-4 mr-2 sm:block"
                  />
                  Export to PDF
                </Button>
              </div>
            </div>
            <div className="mt-8 overflow-auto intro-y lg:overflow-visible sm:mt-0">
              <Table className="border-spacing-y-[10px] border-separate sm:mt-2">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="border-b-0 whitespace-nowrap">
                      IMAGES
                    </Table.Th>
                    <Table.Th className="border-b-0 whitespace-nowrap">
                      PRODUCT NAME
                    </Table.Th>
                    <Table.Th className="text-center border-b-0 whitespace-nowrap">
                      STOCK
                    </Table.Th>
                    <Table.Th className="text-center border-b-0 whitespace-nowrap">
                      STATUS
                    </Table.Th>
                    <Table.Th className="text-center border-b-0 whitespace-nowrap">
                      ACTIONS
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {_.take(fakerData, 4).map((faker, fakerKey) => (
                    <Table.Tr key={fakerKey} className="intro-x">
                      <Table.Td className="box w-40 rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                        <div className="flex">
                          <div className="w-10 h-10 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Midone Tailwind HTML Admin Template"
                              className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                              src={faker.images[0]}
                              content={`Uploaded at ${faker.dates[0]}`}
                            />
                          </div>
                          <div className="w-10 h-10 -ml-5 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Midone Tailwind HTML Admin Template"
                              className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                              src={faker.images[1]}
                              content={`Uploaded at ${faker.dates[1]}`}
                            />
                          </div>
                          <div className="w-10 h-10 -ml-5 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Midone Tailwind HTML Admin Template"
                              className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                              src={faker.images[2]}
                              content={`Uploaded at ${faker.dates[2]}`}
                            />
                          </div>
                        </div>
                      </Table.Td>
                      <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                        <a href="" className="font-medium whitespace-nowrap">
                          {faker.products[0].name}
                        </a>
                        <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                          {faker.products[0].category}
                        </div>
                      </Table.Td>
                      <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                        {faker.stocks[0]}
                      </Table.Td>
                      <Table.Td className="box w-40 rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                        <div
                          className={clsx([
                            "flex items-center justify-center",
                            { "text-success": faker.trueFalse[0] },
                            { "text-danger": !faker.trueFalse[0] },
                          ])}
                        >
                          <Lucide icon="CheckSquare" className="w-4 h-4 mr-2" />
                          {faker.trueFalse[0] ? "Active" : "Inactive"}
                        </div>
                      </Table.Td>
                      <Table.Td
                        className={clsx([
                          "box w-56 rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600",
                          "before:absolute before:inset-y-0 before:left-0 before:my-auto before:block before:h-8 before:w-px before:bg-slate-200 before:dark:bg-darkmode-400",
                        ])}
                      >
                        <div className="flex items-center justify-center">
                          <a className="flex items-center mr-3" href="">
                            <Lucide
                              icon="CheckSquare"
                              className="w-4 h-4 mr-1"
                            />
                            Edit
                          </a>
                          <a className="flex items-center text-danger" href="">
                            <Lucide icon="Trash2" className="w-4 h-4 mr-1" />{" "}
                            Delete
                          </a>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
            <div className="flex flex-wrap items-center mt-3 intro-y sm:flex-row sm:flex-nowrap">
              <Pagination className="w-full sm:w-auto sm:mr-auto">
                <Pagination.Link>
                  <Lucide icon="ChevronsLeft" className="w-4 h-4" />
                </Pagination.Link>
                <Pagination.Link>
                  <Lucide icon="ChevronLeft" className="w-4 h-4" />
                </Pagination.Link>
                <Pagination.Link>...</Pagination.Link>
                <Pagination.Link>1</Pagination.Link>
                <Pagination.Link active>2</Pagination.Link>
                <Pagination.Link>3</Pagination.Link>
                <Pagination.Link>...</Pagination.Link>
                <Pagination.Link>
                  <Lucide icon="ChevronRight" className="w-4 h-4" />
                </Pagination.Link>
                <Pagination.Link>
                  <Lucide icon="ChevronsRight" className="w-4 h-4" />
                </Pagination.Link>
              </Pagination>
              <FormSelect className="w-20 mt-3 !box sm:mt-0">
                <option>10</option>
                <option>25</option>
                <option>35</option>
                <option>50</option>
              </FormSelect>
            </div>
          </div> */}
          {/* END: Weekly Top Products */}
        </div>
      </div>
      <div className="col-span-12 2xl:col-span-3">
        <div className="pb-10 -mb-10 2xl:border-l">
          <div className="grid grid-cols-12 2xl:pl-6 gap-x-6 2xl:gap-x-0 gap-y-6">

            {/* BEGIN: Recent Activities */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-4 2xl:col-span-12 !hidden">
              <div className="flex items-center h-10 intro-x">
                <h2 className="mr-5 text-lg font-medium truncate">
                  Recent Activities
                </h2>
                <a href="" className="ml-auto truncate text-primary">
                  Show More
                </a>
              </div>
              <div className="mt-5 relative before:block before:absolute before:w-px before:h-[85%] before:bg-slate-200 before:dark:bg-darkmode-400 before:ml-5 before:mt-5">
                <div className="relative flex items-center mb-3 intro-x">
                  <div className="before:block before:absolute before:w-20 before:h-px before:bg-slate-200 before:dark:bg-darkmode-400 before:mt-5 before:ml-5">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-full image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={fakerData[9].photos[0]}
                      />
                    </div>
                  </div>
                  <div className="flex-1 px-5 py-3 ml-4 box zoom-in">
                    <div className="flex items-center">
                      <div className="font-medium">
                        {fakerData[9].users[0].name}
                      </div>
                      <div className="ml-auto text-xs text-slate-500">
                        07:00 PM
                      </div>
                    </div>
                    <div className="mt-1 text-slate-500">
                      Has joined the team
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center mb-3 intro-x">
                  <div className="before:block before:absolute before:w-20 before:h-px before:bg-slate-200 before:dark:bg-darkmode-400 before:mt-5 before:ml-5">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-full image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={fakerData[8].photos[0]}
                      />
                    </div>
                  </div>
                  <div className="flex-1 px-5 py-3 ml-4 box zoom-in">
                    <div className="flex items-center">
                      <div className="font-medium">
                        {fakerData[8].users[0].name}
                      </div>
                      <div className="ml-auto text-xs text-slate-500">
                        07:00 PM
                      </div>
                    </div>
                    <div className="text-slate-500">
                      <div className="mt-1">Added 3 new photos</div>
                      <div className="flex mt-2">
                        <Tippy
                          as="div"
                          className="w-8 h-8 mr-1 image-fit zoom-in"
                          content={fakerData[0].products[0].name}
                        >
                          <img
                            alt="Midone Tailwind HTML Admin Template"
                            className="border border-white rounded-md"
                            src={fakerData[8].images[0]}
                          />
                        </Tippy>
                        <Tippy
                          as="div"
                          className="w-8 h-8 mr-1 image-fit zoom-in"
                          content={fakerData[1].products[0].name}
                        >
                          <img
                            alt="Midone Tailwind HTML Admin Template"
                            className="border border-white rounded-md"
                            src={fakerData[8].images[1]}
                          />
                        </Tippy>
                        <Tippy
                          as="div"
                          className="w-8 h-8 mr-1 image-fit zoom-in"
                          content={fakerData[2].products[0].name}
                        >
                          <img
                            alt="Midone Tailwind HTML Admin Template"
                            className="border border-white rounded-md"
                            src={fakerData[8].images[2]}
                          />
                        </Tippy>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="my-4 text-xs text-center intro-x text-slate-500">
                  12 November
                </div>
                <div className="relative flex items-center mb-3 intro-x">
                  <div className="before:block before:absolute before:w-20 before:h-px before:bg-slate-200 before:dark:bg-darkmode-400 before:mt-5 before:ml-5">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-full image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={fakerData[7].photos[0]}
                      />
                    </div>
                  </div>
                  <div className="flex-1 px-5 py-3 ml-4 box zoom-in">
                    <div className="flex items-center">
                      <div className="font-medium">
                        {fakerData[7].users[0].name}
                      </div>
                      <div className="ml-auto text-xs text-slate-500">
                        07:00 PM
                      </div>
                    </div>
                    <div className="mt-1 text-slate-500">
                      Has changed{" "}
                      <a className="text-primary" href="">
                        {fakerData[7].products[0].name}
                      </a>{" "}
                      price and description
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center mb-3 intro-x">
                  <div className="before:block before:absolute before:w-20 before:h-px before:bg-slate-200 before:dark:bg-darkmode-400 before:mt-5 before:ml-5">
                    <div className="flex-none w-10 h-10 overflow-hidden rounded-full image-fit">
                      <img
                        alt="Midone Tailwind HTML Admin Template"
                        src={fakerData[6].photos[0]}
                      />
                    </div>
                  </div>
                  <div className="flex-1 px-5 py-3 ml-4 box zoom-in">
                    <div className="flex items-center">
                      <div className="font-medium">
                        {fakerData[6].users[0].name}
                      </div>
                      <div className="ml-auto text-xs text-slate-500">
                        07:00 PM
                      </div>
                    </div>
                    <div className="mt-1 text-slate-500">
                      Has changed{" "}
                      <a className="text-primary" href="">
                        {fakerData[6].products[0].name}
                      </a>{" "}
                      description
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* END: Recent Activities */}
            {/* BEGIN: Important Notes */}
            {/* <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-12 xl:col-start-1 xl:row-start-1 2xl:col-start-auto 2xl:row-start-auto">
              <div className="flex items-center h-10 intro-x">
                <h2 className="mr-auto text-lg font-medium truncate">
                  Important Notes
                </h2>
                <Button
                  data-carousel="important-notes"
                  data-target="prev"
                  className="px-2 mr-2 border-slate-300 text-slate-600 dark:text-slate-300"
                  onClick={prevImportantNotes}
                >
                  <Lucide icon="ChevronLeft" className="w-4 h-4" />
                </Button>
                <Button
                  data-carousel="important-notes"
                  data-target="next"
                  className="px-2 mr-2 border-slate-300 text-slate-600 dark:text-slate-300"
                  onClick={nextImportantNotes}
                >
                  <Lucide icon="ChevronRight" className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-5 intro-x">
                <div className="box zoom-in">
                  <TinySlider
                    getRef={(el) => {
                      importantNotesRef.current = el;
                    }}
                  >
                    <div className="p-5">
                      <div className="text-base font-medium truncate">
                        Lorem Ipsum is simply dummy text
                      </div>
                      <div className="mt-1 text-slate-400">20 Hours ago</div>
                      <div className="mt-1 text-justify text-slate-500">
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s.
                      </div>
                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="secondary"
                          type="button"
                          className="px-2 py-1"
                        >
                          View Notes
                        </Button>
                        <Button
                          variant="outline-secondary"
                          type="button"
                          className="px-2 py-1 ml-auto"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-base font-medium truncate">
                        Lorem Ipsum is simply dummy text
                      </div>
                      <div className="mt-1 text-slate-400">20 Hours ago</div>
                      <div className="mt-1 text-justify text-slate-500">
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s.
                      </div>
                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="secondary"
                          type="button"
                          className="px-2 py-1"
                        >
                          View Notes
                        </Button>
                        <Button
                          variant="outline-secondary"
                          type="button"
                          className="px-2 py-1 ml-auto"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-base font-medium truncate">
                        Lorem Ipsum is simply dummy text
                      </div>
                      <div className="mt-1 text-slate-400">20 Hours ago</div>
                      <div className="mt-1 text-justify text-slate-500">
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s.
                      </div>
                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="secondary"
                          type="button"
                          className="px-2 py-1"
                        >
                          View Notes
                        </Button>
                        <Button
                          variant="outline-secondary"
                          type="button"
                          className="px-2 py-1 ml-auto"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </TinySlider>
                </div>
              </div>
            </div> */}
            {/* END: Important Notes */}
            {/* BEGIN: Schedules */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-4 2xl:col-span-12 xl:col-start-1 xl:row-start-2 2xl:col-start-auto 2xl:row-start-auto">
              <div className="flex items-center h-10 intro-x">
                <h2 className="mr-5 text-lg font-medium truncate">Schedules</h2>
                <Link
                  to={paths.administrator.tournaments.new.index}
                  className="flex items-center ml-auto truncate text-primary"
                >
                  <Lucide icon="Plus" className="w-4 h-4 mr-1" /> Add New
                  Tournament
                </Link>
              </div>
              <div className="mt-5">
                {upcomingTournaments?.data?.map((tournament, i) => (
                  <div className="intro-x box flex lg:flex-row flex-col py-4 items-stretch" key={i}>
                    <div className="lg:ml-4 h-full lg:w-12 border text-slate-50 bg-emerald-800  rounded-lg py-1 lg:px-2 flex flex-col justify-center items-center font-bold text-lg">
                      {moment(tournament.start_date).format('DD')}
                      <span className="text-white text-sm">{moment(tournament.start_date).format('MMM')}</span>
                    </div>
                    <div className="py-5 px-4">
                      <div className="text-base font-medium truncate">
                        {tournament.name}
                      </div>
                      <div className="mt-1 text-justify text-slate-500">
                        {tournament.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* END: Schedules */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
