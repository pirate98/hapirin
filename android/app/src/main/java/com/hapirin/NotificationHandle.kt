package com.hapirin

import android.util.Log
import com.facebook.react.bridge.*
import com.google.gson.Gson
import com.nifcloud.mbaas.core.*
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class NotificationHandle(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val ACTION_RECEIVED_PUSH = "com.hapirin.RECEIVE_PUSH"
    }

    private val TAG = javaClass.simpleName

    override fun getName(): String = "NotificationHandle"

    @ReactMethod
    fun registerPushHomeAndroid(userId: String, title: String, time: String, promise: Promise) {
        try {
            val dateFormat = SimpleDateFormat("yyyyMMddHHmm", Locale.getDefault())
            val pDate = dateFormat.parse(time) ?: throw IllegalArgumentException("Invalid date format")

            val push = NCMBPush()
            val query = NCMBQuery<NCMBInstallation>("installation")
            val channels = JSONArray().apply { put(userId) }
            query.whereEqualTo("channels", JSONObject().apply { put("\$in", channels) })

            push.setSearchCondition(query)
            push.title = "ちゃりんぶたからお知らせ"
            push.message = "「$title の時間だぶ〜♪」"
            push.target = JSONArray("[android]")
            push.deliveryTime = pDate

            push.sendInBackground { e ->
                if (e != null) {
                    Log.d(TAG, e.message ?: "")
                    promise.resolve("error")
                } else {
                    Log.d(TAG, "Start send notification")
                    promise.resolve("success")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "registerPushHomeAndroid failed", e)
            promise.reject("error", e)
        }
    }

    @ReactMethod
    fun registerPushCreateAndroid(userId: String, title: String, time: String, promise: Promise) {
        try {
            val now = Calendar.getInstance()
            val dateTime = Calendar.getInstance().apply {
                set(now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DATE) + 1,
                    time.substring(0, 2).toInt(), time.substring(2, 4).toInt(), 0)
            }

            val push = NCMBPush()
            val query = NCMBQuery<NCMBInstallation>("installation")
            val channels = JSONArray().apply { put(userId) }
            query.whereEqualTo("channels", JSONObject().apply { put("\$in", channels) })

            push.setSearchCondition(query)
            push.title = "ちゃりんぶたからお知らせ"
            push.message = "「$title の時間だぶ〜♪」"
            push.target = JSONArray("[android]")
            push.deliveryTime = dateTime.time

            push.sendInBackground { e ->
                if (e != null) {
                    Log.d(TAG, e.message ?: "")
                    promise.resolve("error")
                } else {
                    Log.d(TAG, "Start send notification")
                    promise.resolve("success")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "registerPushCreateAndroid failed", e)
            promise.reject("error", e)
        }
    }

    @ReactMethod
    fun updatePushNotification(
        userId: String, title: String, time: String,
        titleOld: String, timeOld: String, promise: Promise
    ) {
        try {
            val dateFormat = SimpleDateFormat("yyyyMMddHHmm", Locale.getDefault())
            val oldDate = dateFormat.parse(timeOld) ?: throw IllegalArgumentException("Invalid old time")
            val newDate = dateFormat.parse(time) ?: throw IllegalArgumentException("Invalid new time")

            val query = NCMBQuery<NCMBObject>("push").apply {
                whereEqualTo("message", "「$titleOld の時間だぶ〜♪」")
                whereEqualTo("status", 0)
            }

            query.findInBackground { results, e ->
                if (e != null || results.isNullOrEmpty()) {
                    promise.reject("error", e ?: Exception("No results"))
                } else {
                    for (obj in results) {
                        val push = obj as NCMBPush
                        val channel = push.searchCondition
                            ?.optJSONObject("channels")
                            ?.optJSONArray("\$in")
                            ?.optString(0)

                        if (channel == userId && oldDate.toString() == push.deliveryTime.toString()) {
                            push.title = "ちゃりんぶたからお知らせ"
                            push.message = "「$title の時間だぶ〜♪」"
                            push.target = JSONArray("[android]")
                            push.deliveryTime = newDate

                            val installationQuery = NCMBQuery<NCMBInstallation>("installation")
                            installationQuery.whereEqualTo("channels", JSONObject().apply {
                                put("\$in", JSONArray().apply { put(userId) })
                            })

                            push.setSearchCondition(installationQuery)

                            push.sendInBackground { err ->
                                if (err != null) {
                                    promise.reject("error", err)
                                } else {
                                    Log.d(TAG, "Updated and sent push")
                                    promise.resolve("success")
                                }
                            }
                            return@findInBackground
                        }
                    }
                    promise.resolve("success")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "updatePushNotification failed", e)
            promise.reject("error", e)
        }
    }

    @ReactMethod
    fun cancelPushNotification(userId: String, title: String, hourMin: String, promise: Promise) {
        try {
            val dateFormat = SimpleDateFormat("yyyyMMddHHmm", Locale.getDefault())
            val targetDate = dateFormat.parse(hourMin) ?: throw IllegalArgumentException("Invalid cancel time")

            val query = NCMBQuery<NCMBObject>("push").apply {
                whereEqualTo("message", "「$title の時間だぶ〜♪」")
                whereEqualTo("status", 0)
            }

            query.findInBackground { results, e ->
                if (e != null || results.isNullOrEmpty()) {
                    Log.e(TAG, "Cancel find failed: ${Gson().toJson(e)}")
                    promise.reject("error", e ?: Exception("No results"))
                } else {
                    for (obj in results) {
                        val push = obj as NCMBPush
                        val channel = push.searchCondition
                            ?.optJSONObject("channels")
                            ?.optJSONArray("\$in")
                            ?.optString(0)

                        if (channel == userId && targetDate.toString() == push.deliveryTime.toString()) {
                            push.deleteInBackground { err ->
                                if (err != null) {
                                    promise.reject("error", err)
                                } else {
                                    Log.d(TAG, "Push notification cancelled")
                                    promise.resolve("success")
                                }
                            }
                            return@findInBackground
                        }
                    }
                    promise.resolve("success")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "cancelPushNotification failed", e)
            promise.reject("error", e)
        }
    }
}
