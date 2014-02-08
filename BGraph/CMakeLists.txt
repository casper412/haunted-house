cmake_minimum_required (VERSION 2.8)
cmake_policy(SET CMP0015 NEW)
project(Grapher)

set(THIRD_PARTY_LIBRARY_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../work/third_party" CACHE STRING "Path to third party")

# ------------------------------------------------------------------------------------------------------------------------------
# Config specific settings
set(BUILD_TYPE_PATH "release")
set(BUILD_TYPE_UPATH "Release")
IF(${CMAKE_BUILD_TYPE} MATCHES "Debug")
  set(BUILD_TYPE_PATH "debug")
  set(BUILD_TYPE_UPATH "Debug")
  add_definitions(-D__WXDEBUG__)
ENDIF(${CMAKE_BUILD_TYPE} MATCHES "Debug")
# ------------------------------------------------------------------------------------------------------------------------------
# Mac OS X Build Settings 
IF(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
  set(BOOST_OS "darwin-4.2/${BUILD_TYPE_PATH}/address-model-32/link-static/macosx-version-min-10.5/macosx-version-10.5/threading-multi/")

  SET(CMAKE_OSX_ARCHITECTURES i386)
  
  set(MAC_LIBS 
  )
ENDIF(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
set(INCLUDE_DIRECTORIES
  ./inc
  ./rsrcs
  ../../NetworkLibraries/common/inc
  ${THIRD_PARTY_LIBRARY_PATH}/
  ${THIRD_PARTY_LIBRARY_PATH}/boost
  ${PLATFORM_INCLUDES}
)

set(LINK_DIRECTORIES
  ${THIRD_PARTY_LIBRARY_PATH}/boost/bin.v2/libs/system/build/${BOOST_OS}/
  ${THIRD_PARTY_LIBRARY_PATH}/boost/bin.v2/libs/thread/build/${BOOST_OS}/
)

set(LIBRARIES
  ${MAC_LIBS}
  ${LINUX_LIBS}
  ${WIN_LIBS}
  boost_system
  boost_thread
)

include_directories(${INCLUDE_DIRECTORIES})
link_directories(${LINK_DIRECTORIES})

# Source and headers
file(GLOB INC_FILES inc/*.h)
file(GLOB SRC_FILES src/*.cpp)

# Resources

add_executable(Grapher MACOSX_BUNDLE ${SRC_FILES} ${INC_FILES} ${RESOURCES})
target_link_libraries(Grapher ${LIBRARIES})

# Put things in execs
set(EXECUTABLE_OUTPUT_PATH         ${CMAKE_CURRENT_SOURCE_DIR}/../execs)
set(EXECUTABLE_OUTPUT_PATH_DEBUG   ${CMAKE_CURRENT_SOURCE_DIR}/../execs)
set(EXECUTABLE_OUTPUT_PATH_RELEASE ${CMAKE_CURRENT_SOURCE_DIR}/../execs)
 
