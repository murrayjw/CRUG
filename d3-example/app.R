#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(survival)
library(dplyr)
source(here::here('km-helpers.R'))

# Define UI for application that draws a histogram
ui <- fluidPage(

    # Application title
    titlePanel("Including a D3 visualization in an application"),

    # Sidebar with a slider input for number of bins 
    sidebarLayout(
        sidebarPanel(
            selectInput("covar",
                        "Select Covariate:",
                        selected = "trt",
                        choices = c('trt', 
                                    'celltype',
                                    'prior'))
        ),

        # Show a plot of the generated distribution
        mainPanel(
          r2d3::d3Output("KMcurve")
        )
    )
)

# Define server logic required to draw a histogram
server <- function(input, output) {
  
  
  

    output$KMcurve <- r2d3::renderD3({
        # generate bins based on input$bins from ui.R
      covariate <- input$covar
      
      model_data <- veteran %>% 
        mutate(covar = factor(!!rlang::sym(covariate)))
      km_model_data <- survfit(Surv(time, status) ~ covar, data = model_data)
      
      r2d3::r2d3(script = here::here('km-curve.js'),
                 data=prep_kmd3_data(km_model_data), 
                 css="styles.css", 
                 d3_version = "6", 
                 dependencies = here::here('utils.js'))
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
