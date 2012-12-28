require "base64"
require "openssl"
require "securerandom"
require "json"

class PolicyController < ApplicationController
  
  def generate
  
    key = "#{SecureRandom.uuid}.jpg"
    content_type = "image/jpeg"
    acl = "public-read"
    bucket = ENV["S3_BUCKET"]
    access_key = ENV["S3_ACCESS_KEY"]
    secret = ENV["S3_SECRET_KEY"]
  
    policy = {
      expiration: (Time.now + 300).utc.strftime("%FT%T.%LZ"),
      conditions: [
        {bucket: bucket},
        {key: key},
        {acl: acl},
        {"Content-Type" => content_type}
      ]
    }
  
    policy_base64 = Base64.strict_encode64 policy.to_json
    signature_base64 = Base64.strict_encode64(OpenSSL::HMAC.digest("sha1", secret, policy_base64))
  
    credentials = Hash.new
    credentials[:policy] = policy_base64
    credentials[:signature] = signature_base64
    credentials[:key] = key
    credentials[:acl] = acl
    credentials[:bucket] = bucket
    credentials[:content_type] = content_type
    credentials[:access_key] = access_key
  
    render json: credentials.to_json

  end

end
