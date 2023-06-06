# Add the helper functions here ---------------------------------------------
# this is a dummy code - you may write your own helpers function
if(FALSE){ library(safetyexploreR); library(ava) }

#' Convert \code{survival::survfit} object to \code{data.frame}
#' 
#' The function accepts a \code{survival::survfit} object and returns
#' a \code{data.frame} suitable for use in the D3 Kaplan Meier plot. 
#'
#' @param survfit_model \code{survival::survfit} instance
#' @return data.frame
#' @export
prep_kmd3_data <- function(survfit_model) {
  
  # extract the data from the survfit model
  km_data <- extract_survfit_data(survfit_model)
  # add the origin point so that the plot begins at time = 0
  kmd3_data <- add_first_row(km_data)
  
  return(kmd3_data)
  
}


#' Add time origin the \code{km_data} object
#' 
#' Internal function to at the origin (i.e. time = 0 ) data to the \code{data.frame}
#' extracted using \code{extract_survfit_data} function. 
#'
#' @param km_data \code{km_data} obtained from the internal \code{extract_survfit_data}
#' function
#' @return data.frame
add_first_row <- function(km_data) {
  
  first_row <- tibble::tribble(
    ~time,  ~n_event,  ~n_censor, ~survival, ~std_err, ~upper, ~lower,
    0,      0,         0,           1,     0,        1,      1
  )
  
  if('group' %in% names(km_data)) {
    group_df <- dplyr::group_by(km_data, group) %>% 
      summarize(n_risk = max(n_risk))
    
    first_row <- cbind(first_row, group_df)
    
  } else {
    first_row <- dplyr::mutate(first_row, n_risk = max(km_data$n_risk))
  }
  
  km_data_origin <- rbind(km_data, first_row)
  
  arrange_cols <- intersect(c("group", "time"), names(km_data_origin))
  km_data_origin <- dplyr::arrange(km_data_origin, 
                                   across({{ arrange_cols }}))
  return(km_data_origin)
}

#' Convert \code{survival::survfit} to \code{data.frame}
#'
#' @param survfit_model \code{survival::survfit} instance
#' @return data.frame
#' @export
extract_survfit_data <- function(survfit_model) {
  
  if(class(survfit_model) != "survfit") {
    stop("model must be a survfit model")
  }
  
  d <- data.frame(time = survfit_model$time,
                  n_risk = survfit_model$n.risk,
                  n_event = survfit_model$n.event,
                  n_censor = survfit_model$n.censor,
                  survival = survfit_model$surv,
                  std_err = survfit_model$std.err,
                  upper = survfit_model$upper,
                  lower = survfit_model$lower)
  
  if(!is.null(survfit_model$strata)) {
    d$group <- rep(names(survfit_model$strata), survfit_model$strata) 
    d$group <- gsub("[^,]*=", '', d$group)
  }
  
  d_extend <- add_first_row(d)
  return(d_extend)
  
}

#' Fit a Kaplan Meier curve via \code{survival::survfit}
#'
#' @param time string representing the time variable in the data
#' @param censor string representing the binary censor in the data
#' @param group string representing the stratification variable in the data
#' @param data a \code{data.frame} containing the time, censor, and group variables
#' @return data.frame
#' @export
fit_survfit_model <- function(time, censor, group, data) {
  
  survival::survfit(survival::Surv(data[[time]], data[[censor]]) ~ data[[group]])
  
}

#' Generate D3 Kaplan Meier curve for shiny output
#'
#' @param data a \code{data.frame} object obtained from extract_survfit_data
#' @param width the width of the plot
#' @param height the height of the plot

#' @export
d3_km_curve <- function(data, options = list(shiny=F, shiny_container = NULL)) {
  r2d3::r2d3(
    data = data,
    script = system.file("inst/js/kmCurveAnimate.js", package = "kmD3"),
    d3_version = "6", 
    dependencies = system.file('inst/js/utils.js', package = "kmD3"),
    options = options
  )
}
