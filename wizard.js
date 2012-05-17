/*
 * Simple Wizard
 * By Barry Rowe
 * Original Source:  http://jsfiddle.net/barryrowe/H2Gu6/
 * NOTES:
 *         -Requires Access to $ jquery object
 *
 *      -SAMPLE HTML STRUCTURE:
 *      <form id="wizard-form" method="POST" action="/">
    
            <ul id="steps-list">
                <li id="step-one"><span class="step-title">One</span>
                    <span class="step-description">First Step</span>
                    <div class="step-content">This is my Content</div></li>
                <li id="step-two">
                    This is my second Content</li>
                        <li id="step-three"><div class="step-title">Three</div><span class="step-description">third step</span>This is my Third content</li>
            </ul>
                        <input type="submit" id="finish" style="display: none;" value="Create" />
            </form>
        -SAMPLE USAGE:
        $(document).ready(function() {            
            buildWizard({ formId:'wizard-form', stepsContainerId:'steps-list', stepContainerTag:'li', finishButtonId:'finish' });
        });
 */
(function($, undefined) {

    var steps = [];
    function showMessage(id) {
        $("#" + id).show();
    }

    function hideMessage(id) {
        $("#" + id).hide();
    }

    function appendMessage(elementId, message) {
        var $message = $("#" + elementId + "_wizard-message");
        if ($message[0] === undefined) {
            $("#" + elementId).after("<span id='" + elementId + "_wizard-message' class='wizard-message invalid'></span>");
            $message = $("#" + elementId + "_wizard-message");
        }
        $message.html(message);
        return $message.attr('id');
    }


    function validateStep(stepId) {
        var $stepContainer = $("#" + stepId)[0];
        var requiredFields = $("input.wizard-required", $stepContainer);

        var valid = true;
        $.each(requiredFields, function(i, element) {
            if (element.value === undefined || element.value === null || $.trim(element.value) === "") {
                valid = false;
                var requiredMsgId = appendMessage(element.id, 'Required');
                showMessage(requiredMsgId);
            } else {
                var emptyMsgId = appendMessage(element.id, '');
                hideMessage(emptyMsgId);

            }
        });

        return valid;
    }

    function hideSteps(wizard) {
        var selector = "#" + wizard.stepsContainerId + ">" + wizard.stepContainerTag;
        $(selector).hide();
    }

    function showStep(id, wizard) {
        hideSteps(wizard);
        $("#" + id).show();
    }

    function stripString(str) {
        return str.replace(/[^a-zA-Z 0-9]+/g, '');
    }

    function wizardStep(id, title, description, active) {
        this.myId = id;
        this.title = title;
        this.description = description;
        this.active = active;
    }

    function buttonBar(currentStep, previousStep, nextStep, isLast) {
        this.currentStep = currentStep;
        this.priorStep = previousStep;
        this.nextStep = nextStep;
        this.isLast = isLast;

        this.getHtml = function() {
            var div = document.createElement('div');
            div.cssClass = 'button-bar';
            if (this.priorStep !== null && this.priorStep !== undefined) {
                var prevSpan = document.createElement('span');
                prevSpan.className = "previous-button-title";
                prevSpan.innerHTML = this.priorStep.title;

                var prevBtn = document.createElement('div');
                prevBtn.className = "previous-button";
                prevBtn.id = this.currentStep.myId + '_prev_button';
                var priorId = this.priorStep.myId;
                prevBtn.onclick = function() {
                    showStep(priorId, wizard);
                };
                prevBtn.innerHTML = "Prev";

                var prevArea = document.createElement('div');
                prevArea.className = 'previous-area';
                prevArea.appendChild(prevSpan);
                prevArea.appendChild(prevBtn);
                div.appendChild(prevArea);
            }

            if (this.nextStep !== null && this.nextStep !== undefined) {
                var nextSpan = document.createElement('span');
                nextSpan.className = "next-button-title";
                nextSpan.innerHTML = this.nextStep.title;

                var nextBtn = document.createElement('div');
                nextBtn.className = "next-button";
                nextBtn.id = this.currentStep.myId + '_next_button';
                var nextId = this.nextStep.myId;
                var currentId = this.currentStep.myId;
                nextBtn.onclick = function() {
                    if (!wizard.isStepValidated || validateStep(currentId)) {
                        showStep(nextId, wizard);
                    }
                };
                nextBtn.innerHTML = "Next";

                var nextArea = document.createElement('div');
                nextArea.className = 'next-area';
                nextArea.appendChild(nextSpan);
                nextArea.appendChild(nextBtn);
                div.appendChild(nextArea);
            } else if (isLast) {
                var finishBtn = document.createElement('div');
                finishBtn.id = "simple-wizard-finish-button";
                finishBtn.className = "finish-button";
                finishBtn.onclick = function() {
                    if (wizard.onSubmit()) {
                        $("#" + wizard.formId).submit();
                    }
                };
                finishBtn.innerHTML = $("#" + wizard.finishButtonId).val();
                var finishArea = document.createElement('div');
                finishArea.className = 'finish-area';
                finishArea.appendChild(finishBtn);
                div.appendChild(finishArea);
            }
            var clearDiv = document.createElement('div');
            clearDiv.style.clear = 'both';
            div.appendChild(clearDiv);
            return div;
        };
    }


    function buildWizard(wizardData) {

        if (wizardData !== null && wizardData !== undefined) {
            wizard = wizardData;
        }
        //Select all direct child tags from container
        var selector = "#" + wizard.stepsContainerId + ">" + wizard.stepContainerTag;
        $(selector).hide();

        var $items = $(selector);
        $.each($items, function(i, item) {

            var title = $(".step-title", item)[0];
            title = title === undefined ? "Next" : title.innerHTML;
            var description = $(".step-description", item)[0];
            description = description === undefined ? "" : description;
            var active = i === 0;
            var step = new wizardStep(item.id, title, description, active);
            if (step.active) {
                $("#" + step.myId).show();
            }
            steps.push(step);
        });

        $.each(steps, function(i, step) {
            var length = steps.length - 1;
            var islast = i == length;
            var bar = new buttonBar(steps[i], steps[i - 1], steps[i + 1], islast);
            $("#" + step.myId)[0].appendChild(bar.getHtml());
        });
    }

    $.fn.wizard = function(options) {
        var wizard = $.extend({
            "formId": this.attr('id'),
            "stepsContainerId": "stepscontainerid",
            "stepContainerTag": "li",
            "finishButtonId": "finish",
            "onSubmit": function() {
                return true;
            },
            "isStepValidated": false
        }, options);

        buildWizard(options);
        return this;
    };

}(jQuery));

$(document).ready(function() {
    var $wizard = $("#wizard-form").wizard({        
        stepsContainerId: 'steps-list',
        stepContainerTag: 'li',
        finishButtonId: 'finish',
        onSubmit: function() {
            return confirm('Sure?');
        },
        isStepValidated: true
    });

    $('#step-two_next_button').click(function(e) {
        return confirm('Extra Click!!');
    });
});

