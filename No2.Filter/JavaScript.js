// 資料來源：https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97
//----------------------------------------------------------------
var funcTimeDelay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

$(function () {
    InitDDL($(".ddl-location"), "Zone");
    InitDDL($(".ddl-price"), "ticktinfo");
    $(".ddl-location, .ddl-price, input[type='checkbox'][name='cbweek']").change(() => {
        SetFilterResult();
    });
    $(".txt-keyword").keyup(function () {
        funcTimeDelay(() => {
            SetFilterResult();
        }, 500);
    });
    SetFilterResult();



    data.records.map((item, i) => {
        return item["Opentime"];
    }).filter((item, i, arr) => {
        if (arr.indexOf(item) === i) {
            console.log(item);
        }
    });
})

function InitDDL($ddl, column) {
    data.records.map((item, i) => {
        return item[column];
    }).filter((item, i, arr) => {
        if (arr.indexOf(item) === i) {
            $ddl.append(`<option value='${item}'>${item === "" ? "未註明" : item}</option>`);
        }
    });
    //$ddl.chosen().trigger("chosen:updated");
}

function SetFilterResult(currentPage) {
    let $list = $(".result-content");
    let $cbWeek = $("input[type='checkbox'][name='cbweek']:checked");
    let keyword = $(".txt-keyword").val();
    let location = $(".ddl-location").val();
    let price = $(".ddl-price").val();
    let searchCount = 0;
    let pageSize = 10;
    currentPage = currentPage || 1;
    $list.html("");

    data.records.map((item, i) => {
        if (location === "-" && price === "-" && keyword === "" && $cbWeek.length === 0) {
            searchCount++;
            return item;
        } else {
            let currentItem, isCondition;
            currentItem = item;

            if (currentItem && location !== "-") {
                if (currentItem.Zone !== location) {
                    currentItem = null;
                }
            }

            if (currentItem && price !== "-") {
                if (currentItem.ticktinfo !== price) {
                    currentItem = null;
                }
            }

            if (currentItem && $cbWeek.length > 0) {
                if (!isInSelectedDayOpen(currentItem, $cbWeek)) {
                    currentItem = null;
                }
            }

            if (currentItem && keyword !== "-") {
                let isFilter = false;
                for (var k in item) {
                    if (item[k] !== null && item[k].toString().indexOf(keyword) > -1) {
                        isFilter = true;
                        break;
                    }
                }

                if (!isFilter) {
                    currentItem = null;
                }
            }

            if (currentItem) {
                searchCount++;
                return currentItem;
            }
        }
    }).filter((item, i) => {
        return item !== undefined;
    }).forEach((item, i) => {
        if (item !== undefined && i < currentPage * 10 && i >= (currentPage - 1) * 10) {
            var itemHTML = GetSearchTemplate()
                .replace("[imgSrc]", `${item.Picture1.substring(0, item.Picture1.indexOf("&") + 1)}w=220`)
                .replace("[title]", item.Name)
                .replace("[desc]", item.Description)
                .replace("[zone]", item.Zone)
                .replace("[price]", item.ticktinfo === "" ? "未註明" : item.ticktinfo)
                .replace("[openTime]", item.Opentime);
            $list.append(itemHTML);
        }
    });

    pageSize = searchCount > 10 ? 10 : searchCount;
    $(".search-count").html(searchCount);
    $(".page-size").html(pageSize);
    $(".page-count").html(Math.ceil(searchCount / pageSize));
    SetPage(Math.ceil(searchCount / pageSize), currentPage);
}

function isInSelectedDayOpen(item, $cbWeek) {
    let isOpen = false;

    //if (item.Opentime.indexOf("每日") > -1)

    $cbWeek.each(function (i, day) {
        if ($(this).is(":checked") && !isOpen) {
            switch ($(this).val()) {
                case "6":
                    if (item.Opentime.indexOf("每日") > -1 ||
                        item.Opentime.indexOf("至週六") > -1 ||
                        item.Opentime.indexOf("週六至") > -1 ||
                        item.Opentime.indexOf("週五、六") > -1 ||
                        item.Opentime.indexOf("至週六20") > -1 ||
                        item.Opentime.indexOf("至週日") > -1 ||
                        item.Opentime.indexOf("全天") > -1 ||
                        item.Opentime.indexOf("、日") > -1 ||
                        item.Opentime.indexOf("假日10") > -1 ||
                        item.Opentime.indexOf("假日09") > -1
                    ) {
                        isOpen = true;
                    }
                    break;
                case "7":
                    if (item.Opentime.indexOf("每日") > -1 ||
                        item.Opentime.indexOf("至週日") > -1 ||
                        item.Opentime.indexOf("全天") > -1 ||
                        item.Opentime.indexOf("、日") > -1 ||
                        item.Opentime.indexOf("假日10") > -1 ||
                        item.Opentime.indexOf("假日09") > -1
                    ) {
                        isOpen = true;
                    }

                    break;
                default:
            }
        }
    });
    return isOpen;
}

function SetPage(totalpage, currentPage) {
    let pageHTML = "";
    let prevPage = (currentPage - 1) === 0 ? 1 : currentPage - 1;
    let nextPage = currentPage === totalpage ? currentPage : currentPage + 1;
    pageHTML += `
        <li class="page-item">
            <a class="page-link" href="javascript:SetFilterResult(${prevPage})" aria-label="Previous">
				<span aria-hidden="true">&laquo;</span>
				<span class="sr-only">Previous</span>
			</a>
        </li>`;
    for (var i = 0; i < totalpage; i++) {
        let pageActivate = "";
        if ((i + 1) === currentPage) {
            pageActivate = "activate";
        }

        pageHTML += `<li class="page-item"><a class="page-link ${pageActivate}" href="javascript:SetFilterResult(${(i + 1)})">${(i + 1)}</a></li>`;
    }

    pageHTML += `
        <li class="page-item">
            <a class="page-link" href="javascript:SetFilterResult(${nextPage})" aria-label="Next">
				<span aria-hidden="true">&raquo;</span>
				<span class="sr-only">Next</span>
			</a>
        </li>`;
    $(".pagination").html(pageHTML);
}

function GetSearchTemplate() {
    return `<div>
            <img src="[imgSrc]" alt="">
            <div class="detail">
              <h4>[title]</h4>
              <p>[desc]</p>
              <div class="info">
                <div>
                  <i class="fas fa-map-marker-alt"></i>[zone]
                </div>
                <div>
                  <i class="fas fa-dollar-sign"></i>[price]
                </div>
                <div>
                  <i class="far fa-calendar-alt"></i>[openTime]
                </div>
              </div>
            </div>
          </div>`;
}