class EmancipationsController < ApplicationController
  before_action :require_organization!
  after_action :verify_authorized
  ADD_CATEGORY = "add_category"
  ADD_OPTION = "add_option"
  DELETE_CATEGORY = "delete_category"
  DELETE_OPTION = "delete_option"
  SET_OPTION = "set_option"
  CHECK_ITEM_ACTIONS = [ADD_CATEGORY, ADD_OPTION, DELETE_CATEGORY, DELETE_OPTION, SET_OPTION].freeze

  def show
    @current_case = CasaCase.find(params[:casa_case_id])
    authorize @current_case
    @emancipation_form_data = EmancipationCategory.all
  end

  def save
    authorize CasaCase, :save_emancipation?
    params.permit(:casa_case_id, :check_item_action)

    begin
      current_case = CasaCase.find(params[:casa_case_id])
      authorize current_case, :update_emancipation_option?
    rescue ActiveRecord::RecordNotFound
      render json: {error: "Could not find case from id given by casa_case_id"}
      return
    end

    unless current_case.in_transition_age?
      render json: {error: "The current case is not marked as transitioning"}
      return
    end
    check_item_action = params[:check_item_action]
    begin
      case check_item_action
        when ADD_CATEGORY
          current_case.add_emancipation_category(params[:check_item_id])
          render json: "success".to_json # TODO use {status: success} instead - update UI to match
        when ADD_OPTION
          current_case.add_emancipation_option(params[:check_item_id])
          render json: "success".to_json
        when DELETE_CATEGORY
          current_case.remove_emancipation_category(params[:check_item_id])
          current_case.emancipation_options.delete(EmancipationOption.category_options(params[:check_item_id]))
          render json: "success".to_json
        when DELETE_OPTION
          current_case.remove_emancipation_option(params[:check_item_id])
          render json: "success".to_json
        when SET_OPTION
          current_case.emancipation_options.delete(EmancipationOption.category_options(EmancipationOption.find(params[:check_item_id]).emancipation_category_id))
          current_case.add_emancipation_option(params[:check_item_id])
          render json: "success".to_json
        else
          render json: {error: "Check item action: #{check_item_action} is not a supported action"}
      end
    rescue ActiveRecord::RecordNotFound
      render json: {error: "Could not find option from id given by param check_item_id"}
    rescue ActiveRecord::RecordNotUnique
      render json: {error: "Option already added to case"}
    rescue => error # TODO catch only specific errors?
      render json: {error: error.message}
    end
  end

  # Render a json error for json endpoints
  def not_authorized(exception)
    if exception.backtrace[1].end_with?("save'")
      render json: {error: "Sorry, you are not authorized to perform this action. Did the session expire?"}
    else
      super()
    end
  end
end
